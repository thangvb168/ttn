import { AbstractModel } from "@/models/AbstractModel";

interface AbstractMockProps<T extends AbstractModel> {
  defaultData: T[];
}

export class AbstractMock<T extends AbstractModel> {
  private defaultData: T[];

  constructor({ defaultData }: AbstractMockProps<T>) {
    this.defaultData = defaultData;
  }

  getAll(): T[] {
    return this.defaultData;
  }

  getAllWithPagination(page: number, limit: number): T[] {
    const start = (page - 1) * limit;
    return this.defaultData.slice(start, start + limit);
  }

  getById(id: string): T | undefined {
    return this.defaultData.find((item) => item.id === id);
  }

  create(item: T): T {
    this.defaultData.push(item);
    return item;
  }

  update(id: string, updatedItem: Partial<T>): T | undefined {
    const index = this.defaultData.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.defaultData[index] = { ...this.defaultData[index], ...updatedItem };
    return this.defaultData[index];
  }

  delete(id: string): boolean {
    const index = this.defaultData.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.defaultData.splice(index, 1);
    return true;
  }
}
