import { Entity, Column, Index } from 'typeorm';
import { Model } from './'

enum RoleEnumType {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity('users')
class User extends Model {
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

  toJSON(): User {
    return { ...this, password: undefined, verified: undefined };
  }
}

export { RoleEnumType };
