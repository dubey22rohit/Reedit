import { User } from "../entities/Users";
import { CustomSessionData, MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";

import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  //ME Query
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    let sess = req.session as CustomSessionData;
    console.log('SESSION : ',sess)
    if (!sess.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: sess.userId });
    return user;
  }

  //Register Mutation
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 3) {
      return {
        errors: [
          {
            field: "username",
            message: "username must be atleast 3 characters long",
          },
        ],
      };
    }
    if (options.password.length <= 4) {
      return {
        errors: [
          {
            field: "password",
            message: "password must be atleast 4 characters long",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505" || error.detail.includes("already exists.")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    //Setting the user cookie while registering so that a user is logged in as well after registering
    let sess = req.session as CustomSessionData;
    sess.userId = user.id;

    return { user };
  }

  //Login mutation
  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{ field: "username", message: "This username does not exist" }],
      };
    }
    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }
    let sess = req.session as CustomSessionData;
    sess.userId = user.id;
    // sess.anyRandomThing = 'Anything'; We can add anything to our session object
    return { user };
  }
}
