import { Entity, Column, Index, BeforeInsert } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { Model } from './'

export enum RoleEnumType {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity('users')
export class User extends Model {

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Index('email_index')
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: RoleEnumType,
    default: RoleEnumType.USER
  })
  role: RoleEnumType;

  @Column({ default: false })
  verified: boolean;

  /** ? Hash password before saving to database */
  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 12);
  }

  /** ? Validate password */
  static async comparePasswords(
    candidatePassword: string,
    hashedPassword: string
  ) {
    return await compare(candidatePassword, hashedPassword);
  }

  toJSON(): User {
    return { ...this, password: undefined, verified: undefined };
  }
}

// export { RoleEnumType };
// export { User };
