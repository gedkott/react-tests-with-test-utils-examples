import ReactTestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';
import React, { useState } from 'react';

const act = ReactTestUtils.act;

const Form = (props) => {
    const apiService = props.apiService;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState();
    const [message, setMessage] = useState();
    
    const onClick = () => {
        apiService.callAPI({ firstName, lastName })
            .then(({ accountId, message }) => {
                setMessage(message);
                props.onReceiveAccountID(accountId)
            })
            .catch(({ error }) => {
                setError(error);
            });
    };

    const onFirstNameChange = (event) => {
        setFirstName(event.target.value)
    };

    const onLastNameChange = (event) => {
        setLastName(event.target.value)
    };

    return <>
        <form>
            {message && <div className="message">{message}</div>}
            {error && <div className="error">{error}</div>}
            <label>First Name: <input name="first-name" onChange={onFirstNameChange} value={firstName}/></label>
            <label>Last Name: <input name="last-name" onChange={onLastNameChange} value={lastName}/></label>
            <button onClick={onClick}>Save</button>
        </form>
    </>
};

class Wrapper extends React.Component {
    render () {
        return <>{this.props.children}</>
    }
}

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

it('works with a form, mocked API call (just through a prop apiService), and rendering different content based on response (success)', () => {
    const accountId = '12345';
    const onReceiveAccountID = jest.fn();
    const apiPromise = Promise.resolve({ accountId, message: `Welcome, ${"Gedalia"} ${"Kott"}`});
    const mockApiService = { callAPI: ({ firstName: _firstName, lastName: _lastName }) => {
        return apiPromise;
    }};

    act(() => {
        comp = ReactDom.render(
            <Wrapper>
                <Form
                    onReceiveAccountID={onReceiveAccountID} 
                    apiService={mockApiService}/>
            </Wrapper>,
            container
        );
    });

    expect(ReactTestUtils.isCompositeComponentWithType(comp, Wrapper)).toBe(true);

    let inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(comp, "input");
    expect(inputs.length).toBe(2);

    let submitButton = ReactTestUtils.findRenderedDOMComponentWithTag(comp, 'button');
    expect(submitButton).toBeTruthy();

    let firstName = inputs.find((input) => {
        return input.getAttribute('name') == 'first-name';
    });

    let lastName = inputs.find((input) => {
        return input.getAttribute('name') == 'last-name';
    });
    
    act(() => {
        ReactTestUtils.Simulate.change(firstName, { target: { value: 'Gedalia' } } );
        ReactTestUtils.Simulate.change(lastName, { target: { value: 'Kott' } } );   
    });

    act(() => {
        ReactTestUtils.Simulate.click(submitButton); 
    });
    
    expect(firstName).toBeTruthy();
    expect(lastName).toBeTruthy();

    // Be careful to wrap with act and only act on the submit button on its own after all other inputs are filled in a had their change or similar events issued and acted
    return act(() => {
        return apiPromise.then(() => {
            let message_div;
            let get_message_div = () => {
                message_div = container.querySelector('.message');
                return message_div;
            };
        
            return awaitSomething(get_message_div).then(() => {
                expect(onReceiveAccountID).toHaveBeenCalledWith(accountId);
                expect(message_div.textContent).toBe("Welcome, Gedalia Kott");
            })
        });
    });
});

it('works with a form, mocked API call (just through a prop apiService), and rendering different content based on response (error)', () => {
    const onReceiveAccountID = jest.fn();
    const apiPromise = Promise.reject({ error: "Bad Request" });
    const mockApiService = { callAPI: ({ firstName: _firstName, lastName: _lastName }) => {
        return apiPromise;
    }};

    act(() => {
        comp = ReactDom.render(
            <Wrapper>
                <Form
                    onReceiveAccountID={onReceiveAccountID} 
                    apiService={mockApiService}/>
            </Wrapper>,
            container
        );
    });

    expect(ReactTestUtils.isCompositeComponentWithType(comp, Wrapper)).toBe(true);

    let inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(comp, "input");
    expect(inputs.length).toBe(2);

    let submitButton = ReactTestUtils.findRenderedDOMComponentWithTag(comp, 'button');
    expect(submitButton).toBeTruthy();

    let firstName = inputs.find((input) => {
        return input.getAttribute('name') == 'first-name';
    });

    let lastName = inputs.find((input) => {
        return input.getAttribute('name') == 'last-name';
    });
    
    act(() => {
        ReactTestUtils.Simulate.change(firstName, { target: { value: 'Gedalia' } } );
        ReactTestUtils.Simulate.change(lastName, { target: { value: 'Kott' } } );   
    });

    act(() => {
        ReactTestUtils.Simulate.click(submitButton); 
    });
    
    expect(firstName).toBeTruthy();
    expect(lastName).toBeTruthy();

    // Be careful to wrap with act and only act on the submit button on its own after all other inputs are filled in a had their change or similar events issued and acted
    return act(() => {
        return apiPromise.catch(()=>Promise.resolve()).then(() => {
            let error_div;
            let get_error_div = () => {
                error_div = container.querySelector('.error');
                return error_div;
            };
        
            return awaitSomething(get_error_div).then(() => {
                expect(onReceiveAccountID).not.toHaveBeenCalled();
                expect(error_div.textContent).toBe("Bad Request");
            })
        });
    });
});


