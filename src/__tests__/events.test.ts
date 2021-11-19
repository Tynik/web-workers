import { Events } from '../events';

describe('Add, raise and remove events', () => {
  it('should add new event', () => {
    const events = new Events();
    expect(events.count).toBe(0);

    events.add('test', () => {});
    expect(events.count).toBe(1);
  });

  it('should clear all events', () => {
    const events = new Events();
    expect(events.count).toBe(0);

    events.add('test', () => {});
    expect(events.count).toBe(1);

    events.clear();
    expect(events.count).toBe(0);
  });

  it('should remove event by name', () => {
    const events = new Events();
    expect(events.count).toBe(0);

    events.add('test', () => {});
    expect(events.count).toBe(1);

    events.remove('test');
    expect(events.count).toBe(0);
  });

  it('should add new callback for existed event', () => {
    const events = new Events();
    expect(events.getCountCallbacks('test')).toBe(0);

    events.add('test', () => {});
    expect(events.getCountCallbacks('test')).toBe(1);

    events.add('test', () => {});
    expect(events.getCountCallbacks('test')).toBe(2);
  });

  it('should remove event callback with using event api', () => {
    const events = new Events();

    const eventApi = events.add('test', () => {});
    expect(events.getCountCallbacks('test')).toBe(1);

    eventApi.remove();
    expect(events.getCountCallbacks('test')).toBe(0);
  });

  it('should call event callback when event is raised', () => {
    const events = new Events();

    const eventCallback = jest.fn();
    events.add('test', eventCallback);
    expect(eventCallback).toBeCalledTimes(0);

    events.raise('test');
    expect(eventCallback).toBeCalledTimes(1);
  });

  it('should call all event callbacks when event is raised', () => {
    const events = new Events();

    const eventCallback1 = jest.fn();
    events.add('test', eventCallback1);

    const eventCallback2 = jest.fn();
    events.add('test', eventCallback2);

    events.raise('test');
    expect(eventCallback1).toBeCalledTimes(1);
    expect(eventCallback2).toBeCalledTimes(1);
  });

  it('should remove event callback after raising when once=true is passed', () => {
    const events = new Events();

    const eventCallback = jest.fn();
    events.add('test', eventCallback, true);
    expect(events.getCountCallbacks('test')).toBe(1);

    events.raise('test');
    expect(eventCallback).toBeCalledTimes(1);
    expect(events.getCountCallbacks('test')).toBe(0);
  });

  it('should not remove callback after raising event when once=true is passed when returned false from callback', () => {
    const events = new Events();

    const eventCallback = jest.fn().mockReturnValue(false);
    events.add('test', eventCallback, true);

    events.raise('test');
    expect(eventCallback).toBeCalledTimes(1);
    expect(events.getCountCallbacks('test')).toBe(1);
  });

  it('should remove event callback after raising when once=true is passed for specific event', () => {
    const events = new Events();

    const eventCallback1 = jest.fn();
    events.add('test', eventCallback1, true);

    const eventCallback2 = jest.fn();
    events.add('test', eventCallback2);

    expect(events.getCountCallbacks('test')).toBe(2);

    events.raise('test');
    // first events should be removed
    expect(events.getCountCallbacks('test')).toBe(1);

    // call 2 times to check that only second callback was called 2 times
    // and the first was removed after first call
    events.raise('test');
    expect(eventCallback1).toBeCalledTimes(1);
    expect(eventCallback2).toBeCalledTimes(2);
  });
});
