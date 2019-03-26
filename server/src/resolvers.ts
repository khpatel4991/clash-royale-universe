import { IResolvers } from 'graphql-tools';
import * as argon2 from 'argon2';

import { stripe } from './stripe';
import { User } from './entity/User';

export const resolvers: IResolvers = {
  Query: {
    me: async (_, __, { req }) => {
      if (!req.session.userId) {
        return null;
      }
      const user = await User.findOne(req.session.userId);
      return user;
    },
  },
  Mutation: {
    login: async (_, { email, password }, { req }) => {
      try {
        console.time(`Logging in ${email}: `);
        const user = await User.findOne({ where: { email } });
        console.timeEnd(`Logging in ${email}: `);
        if (!user) {
          throw new Error(`No user with email ${email}`);
        }
        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
          throw new Error(`Password mismatch for ${email}`);
        }
        req.session.userId = user.id;
        return user;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    register: async (_, { email, password }) => {
      const hashedPassword: string = await argon2.hash(password);
      await User.create({
        email,
        password: hashedPassword,
      }).save();
      return true;
    },
    createSubscription: async (_, { source }, { req }) => {
      if (!req.session || !req.session.userId) {
        throw new Error('Not Authenticated.');
      }
      console.time(`Assign tag "${source} to ${req.session.userId}"`);
      const user = await User.findOneOrFail(req.session.userId);
      console.timeEnd(`Assign tag "${source} to ${req.session.userId}"`);
      const customer = await stripe.customers.create({
        email: user.email,
        source,
      });
      user.stripeId = customer.id;
      user.type = 'paid';
      await user.save();
      return user;
    },
  },
};
