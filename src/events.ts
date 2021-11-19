export type EventCallback<Result = any> = (result?: Result) => void | boolean

export type Event<Result = any> = {
  id: string
  callback: EventCallback<Result>
  once: boolean
};

export type EventsList<List extends string> =
  Partial<Record<List, Event<any>[]>>

export interface EventAPI {
  remove: () => void;
}

export class Events<Events extends string = any> {
  private list: EventsList<Events> = {};

  add<Result = any>(name: string, callback: EventCallback<Result>, once: boolean = false): EventAPI {
    if (!this.list[name]) {
      this.list[name] = [];
    }
    // set event id to remove event after when needed
    const id = this.list[name].length;
    // multiple callbacks for one event
    this.list[name].push({ id, callback, once });

    return {
      remove: () => {
        this.removeById(name, id);
      }
    };
  }

  raise<Result = any>(name: string, result?: Result): void {
    (
      this.list[name] || []
    ).reduceRight((_, { id, callback, once }) => {
      let remove;
      try {
        remove = callback(result);
      } finally {
        if (remove !== false && once) {
          this.removeById(name, id);
        }
      }
    }, []);
  }

  get count(): number {
    return Object.keys(this.list).length;
  }

  getCountCallbacks(name: string): number {
    return this.list[name]?.length || 0;
  }

  remove(name: string): void {
    delete this.list[name];
  }

  clear(): void {
    this.list = {};
  }

  private removeById(name: string, id: string): void {
    const indexToRemove = this.list[name].findIndex(event => event.id === id);
    this.list[name].splice(indexToRemove, 1);
  }
}
