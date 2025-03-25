import { users, type User, type InsertUser, type Adr, type InsertAdr } from "@shared/schema";

// Modify the interface with any CRUD methods needed
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAdr(id: number): Promise<Adr | undefined>;
  listAdrs(): Promise<Adr[]>;
  createAdr(adr: InsertAdr): Promise<Adr>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private adrs: Map<number, Adr>;
  private userCurrentId: number;
  private adrCurrentId: number;

  constructor() {
    this.users = new Map();
    this.adrs = new Map();
    this.userCurrentId = 1;
    this.adrCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAdr(id: number): Promise<Adr | undefined> {
    return this.adrs.get(id);
  }

  async listAdrs(): Promise<Adr[]> {
    return Array.from(this.adrs.values());
  }

  async createAdr(insertAdr: InsertAdr): Promise<Adr> {
    const id = this.adrCurrentId++;
    const adr: Adr = { 
      ...insertAdr, 
      id,
      createdAt: new Date()
    };
    this.adrs.set(id, adr);
    return adr;
  }
}

export const storage = new MemStorage();
