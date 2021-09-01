import ReactTestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';
import React from 'react';
import { Suspense } from "react";
import "./styles.css";

const act = ReactTestUtils.act;

import App from './App.js';
import LazyApp from './LazyApp.js';
import ThirdPartyApp from './ThirdPartyApp.js';

let container;
let comp;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
})

afterEach(() => {
    document.body.removeChild(container);
    container = null;
})

it('works with regular old components (using DOM API to search)', () => {
    act(() => {
        ReactDom.render(<App> </App>, container);
    });
    const h1 = container.querySelector('h1');
    expect(h1.textContent).toBe("Hello asddsd");
});

function awaitSomething(f) {
    return new Promise((resolve, reject) => {
        setInterval(() => {
            let v = f()
            if (v !== null && v !== undefined) {
                resolve()
            }
        }, 10);
    });
}

it('works with components that are rendered through suspense and lazy (using DOM API to search)', () => {
    act(() => {
        ReactDom.render(
            <Suspense fallback="WTF!">
                <LazyApp />
            </Suspense>,
            container
        );
    });

    let h1;
    let get_h1 = () => {
        h1 = container.querySelector('h1');
        return h1;
    };

    return awaitSomething(get_h1).then(() => {
        expect(h1.textContent).toBe("Hello asddsd");
    })
});

it('works with third party components (but not using the component class + findRenderedComponentWithType) (using ReactTestUtils API to search)', () => {
    act(() => {
        comp = ReactDom.render(
            <ThirdPartyApp></ThirdPartyApp>,
            container
        );
    });

    let b = ReactTestUtils.findRenderedDOMComponentWithTag(comp, 'button');

    expect(b.textContent).toBe("Hello World");
});

it('works with form inputs (can change values using react test utils API and see callbacks handle input)', () => {
    class Input extends React.Component {
        render() {
            return <div>
                <input onChange={this.props.onChange}></input>
            </div>
        }
    }

    let value;

    act(() => {
        comp = ReactDom.render(
            <Input onChange={(event) => { value = event.target.value; }}></Input>,
            container
        );
    });

    let i = ReactTestUtils.findRenderedDOMComponentWithTag(comp, 'input');
    i.value = "SOME INPUT";
    ReactTestUtils.Simulate.change(i);

    expect(value).toBe("SOME INPUT");
});
