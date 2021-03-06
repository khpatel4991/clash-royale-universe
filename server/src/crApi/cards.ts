import axios from 'axios';
import { Card } from '../entity/Player';

const CLASH_API_KEY = process.env.CLASH_API_KEY;

export const getCards = async (): Promise<Array<Card>> => {
  try {
    const url = 'https://api.clashroyale.com/v1/cards';
    const res = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        authorization: `Bearer ${CLASH_API_KEY}`,
      },
    });
    return res.data.items;
  } catch (e) {
    console.log(`No cards found. Error: ${e}`);
    return [];
  }
};
