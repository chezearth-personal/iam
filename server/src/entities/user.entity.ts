import crypto from 'crypto';
import { Entity, Column, Index, BeforeInsert } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { Model } from './'

export { RoleEnumType, User };

enum RoleEnumType {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity('users')
class User extends Model {

  @Column()
  firstname: string;

  @Column()
  lastname: string;

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

  @Index('verificationcode_index')
  @Column({
    type: 'text',
    nullable: true
  })
  verificationcode!: string | null;

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

  static createVerificationCode() {
    const verificationcode = crypto.randomBytes(32).toString('hex');
    const hashedVerificationCode = crypto
      .createHash('sha256')
      .update(verificationcode)
      .digest('hex');
    return { verificationcode, hashedVerificationCode };
  }

  toJSON(): User {
    return { ...this, password: undefined, verified: undefined };
  }
}
