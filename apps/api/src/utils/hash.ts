import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";

export const hashPassword = async (value: string) => bcrypt.hash(value, 12);
export const comparePassword = async (value: string, hash: string) => bcrypt.compare(value, hash);
export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
