import {
    Component,
    createMemo,
    createSignal,
    For,
    onCleanup,
    onMount
} from 'solid-js';
import styles from './App.module.css';
import { words } from './words';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const LETTER_COUNT = 5;
const TRYS = 6;

const GREEN = '#6aaa64';
const YELLOW = '#c9b458';
const GRAY = '#86888a';

function isLetter(str: string) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function state2Color(state?: number) {
    if (state === 0) {
        return '#fff';
    }
    if (state === 1) {
        return GREEN;
    }
    if (state === 2) {
        return YELLOW;
    }
    if (state === 3) {
        return GRAY;
    }

    return '#fff';
}

function initializePanels() {
    return new Array(TRYS).fill([]).map(() =>
        new Array(LETTER_COUNT).fill(null).map(() => ({
            letter: '',
            state: 0
        }))
    );
}

const [word, setWord] = createSignal('');
const [panels, setPanels] = createSignal<
    {
        letter: string;
        state: number;
    }[][]
>(initializePanels());
const [currentTry, setCurrentTry] = createSignal(0);
const letter2State = createMemo(() => {
    const l2s: Record<string, number> = {};
    LETTERS.split('').forEach((l) => {
        l2s[l] = 0;
    });

    const p = panels();
    p.forEach((row) => {
        row.forEach((n) => {
            if (l2s[n.letter] === 0) {
                l2s[n.letter] = n.state;
            } else if ([1, 2, 3].includes(n.state)) {
                l2s[n.letter] = Math.min(l2s[n.letter], n.state);
            }
        });
    });

    return l2s;
});

function pickWord() {
    const w = words[Math.floor(Math.random() * words.length)];
    setWord(w);
}

function keydown(e: KeyboardEvent) {
    console.log(e);
    e.preventDefault();
    e.stopPropagation();

    let key = e.key;
    const t = currentTry();
    const p = panels();

    if (key === 'Enter') {
        test();
        return;
    }

    if (key === 'Backspace') {
        for (let i = 0; i < LETTER_COUNT; i++) {
            if (p[t][LETTER_COUNT - 1 - i].letter !== '') {
                p[t][LETTER_COUNT - 1 - i].letter = '';
                break;
            }
        }
        setPanels(JSON.parse(JSON.stringify(p)));
        return;
    }

    key = key.toLowerCase();
    if (!isLetter(key)) {
        return;
    }

    for (let i = 0; i < LETTER_COUNT; i++) {
        if (p[t][i].letter === '') {
            p[t][i].letter = key;
            break;
        }
    }

    setPanels(JSON.parse(JSON.stringify(p)));
}

function test() {
    const t = currentTry();
    const p = panels();
    const w = word();
    const row = p[t];
    const inputWord = row.map((n) => n.letter).join('');

    if (inputWord.length !== 5) {
        alert('Not enough letters');
        return;
    }

    if (!words.includes(inputWord)) {
        alert('Not in word list');
        return;
    }

    for (let i = 0; i < LETTER_COUNT; i++) {
        const l = inputWord[i];
        if (l === w[i]) {
            row[i].state = 1;
        } else if (w.includes(l)) {
            row[i].state = 2;
        } else {
            row[i].state = 3;
        }
    }

    setCurrentTry(t + 1);
    setPanels(JSON.parse(JSON.stringify(p)));

    if (inputWord === w) {
        alert('Success!');
    } else if (t + 1 >= TRYS) {
        alert(w);
    }
}

function restart() {
    pickWord();
    setCurrentTry(0);
    setPanels(initializePanels());
}

const Panel = () => {
    return (
        <For each={new Array(TRYS).fill(0)}>
            {({ _ }, i) => {
                return (
                    <div style={{}}>
                        <For each={new Array(LETTER_COUNT).fill(0)}>
                            {({ __ }, j) => {
                                return (
                                    <div
                                        class={styles.block}
                                        style={{
                                            background: state2Color(
                                                panels()?.[i()]?.[j()]?.state
                                            )
                                        }}
                                    >
                                        <span class={styles.blockText}>
                                            {panels()?.[i()]?.[j()]?.letter}
                                        </span>
                                    </div>
                                );
                            }}
                        </For>
                    </div>
                );
            }}
        </For>
    );
};

const Keyboard = () => {
    return (
        <div class={styles.keyboard}>
            <div>
                <For each={['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']}>
                    {(l) => (
                        <div
                            class={styles.key}
                            style={{
                                background: state2Color(letter2State()[l])
                            }}
                        >
                            <span>{l}</span>
                        </div>
                    )}
                </For>
            </div>
            <div>
                <For each={['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']}>
                    {(l) => (
                        <div
                            class={styles.key}
                            style={{
                                background: state2Color(letter2State()[l])
                            }}
                        >
                            <span>{l}</span>
                        </div>
                    )}
                </For>
            </div>
            <div>
                <For each={['z', 'x', 'c', 'v', 'b', 'n', 'm']}>
                    {(l) => (
                        <div
                            class={styles.key}
                            style={{
                                background: state2Color(letter2State()[l])
                            }}
                        >
                            <span>{l}</span>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
};

const Buttons = () => {
    return (
        <>
            <div>
                <button
                    onClick={() => {
                        test();
                    }}
                >
                    Enter
                </button>
                <button
                    onClick={() => {
                        restart();
                    }}
                >
                    Restart
                </button>
                <button
                    onClick={() => {
                        alert(word());
                    }}
                >
                    Answer
                </button>
            </div>
        </>
    );
};

const Content = () => {
    onMount(() => {
        pickWord();
    });

    onMount(() => {
        document.addEventListener('keydown', keydown);
    });

    onCleanup(() => {
        document.removeEventListener('keydown', keydown);
    });

    return (
        <div>
            <Panel />
            <Buttons />
            <Keyboard />
        </div>
    );
};

const App: Component<{}> = ({}) => {
    return (
        <div class={styles.App}>
            <Content />
        </div>
    );
};

export default App;
