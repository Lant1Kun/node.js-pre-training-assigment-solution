export class InMemoryRepository<T extends { id: number }> {
  // private storage
  private items: T[] = [];

  add(entity: T): T {
    const result = this.items;
    result.push(entity);
    return entity;
  }

  update(id: number, patch: Partial<T>): T {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.id === id) {
        const updated = patch;
        const old = item;
        const newtodo : T = {
          ...old,
          ...updated,
        };
        this.items[i] = newtodo;
        return this.items[i];
      }
    }
    throw new Error("No id in array");
  }

  remove(id: number): void {
    this.items = this.items.filter(todo => todo.id != id);
  }

  findById(id: number): T | undefined {
    let item : T | undefined;
    item = undefined;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].id === id) {
        item = this.items[i];
      }
    }
    return item;
  }

  findAll(): T[] {
    return [...this.items];
  }
}