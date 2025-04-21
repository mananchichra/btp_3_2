import { users, type User, type InsertUser, type Adr, type InsertAdr } from "@shared/schema";

// Modify the interface with any CRUD methods needed
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAdr(id: number): Promise<Adr | undefined>;
  listAdrs(): Promise<Adr[]>;
  createAdr(adr: InsertAdr): Promise<Adr>;
  // New methods for handling feedback and refinements
  createRefinedAdr(adr: InsertAdr, originalId: number): Promise<Adr>;
  getRefinedAdrs(originalId: number): Promise<Adr[]>;
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
    // Return only original ADRs (not refinements)
    return Array.from(this.adrs.values()).filter(adr => {
      // If it has no originalAdrId, it's an original ADR
      return adr.originalAdrId === null || adr.originalAdrId === undefined;
    });
  }

  async createAdr(insertAdr: InsertAdr): Promise<Adr> {
    const id = this.adrCurrentId++;
    const adr: Adr = { 
      ...insertAdr, 
      id,
      createdAt: new Date(),
      originalAdrId: null,
      feedback: null
    };
    this.adrs.set(id, adr);
    return adr;
  }

  async createRefinedAdr(insertAdr: InsertAdr, originalId: number): Promise<Adr> {
    // Create the refined ADR with a reference to the original
    const id = this.adrCurrentId++;
    const adr: Adr = { 
      ...insertAdr, 
      id,
      createdAt: new Date(),
      originalAdrId: originalId,
      feedback: insertAdr.feedback || null
    };
    this.adrs.set(id, adr);
    return adr;
  }

  async getRefinedAdrs(originalId: number): Promise<Adr[]> {
    // Find all ADRs that have this originalAdrId
    const refinedAdrs = Array.from(this.adrs.values()).filter(adr => 
      adr.originalAdrId === originalId
    );
    
    // Sort by creation date (newest first)
    return refinedAdrs.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
