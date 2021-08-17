import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() //For GQL
@Entity() //For our DB
export class User {
  @Field() //For GQL
  @PrimaryKey() //For Mikro-ORM
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  created_at = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updated_at = new Date();

  @Field()
  @Property({ type: "text", unique: true })
  username!: string;

  //Not exposing password prop to GQL
  @Property({ type: "text" })
  password!: string;
}
