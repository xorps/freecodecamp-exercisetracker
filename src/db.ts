import {BaseEntity, Column, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn, JoinColumn} from 'typeorm';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    public _id?: number;

    @Column({type: 'varchar', nullable: false, length: 255})
    public username?: string;

    @OneToMany(() => Exercise, exercise => exercise.user)
    public exercises?: Exercise[];
}

@Entity()
export class Exercise extends BaseEntity {
    @PrimaryGeneratedColumn()
    public _id?: number;

    @Column({type: 'varchar', nullable: false, length: 255})
    public description?: string;

    @Column({type: 'integer', nullable: false})
    public duration?: number;

    @Column({type: 'text', nullable: false})
    public date?: string;

    @ManyToOne(() => User, user => user.exercises)
    @JoinColumn()
    public user?: User;
}
