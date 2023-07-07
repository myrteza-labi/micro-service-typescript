import axios from 'axios';
import { map } from 'ramda';

test('GET /voitures should retrieve an array of cars with expected properties', async () => {
  const response = await axios.get('http://localhost:4000/voitures');
  expect(response.status).toBe(200);

  const expectedProperties = { couleur: expect.stringMatching(/.*/), marque: expect.stringMatching(/.*/) };
  const cars = response.data;

  expect(Array.isArray(cars)).toBe(true);
  map((car: any) => {
    expect(car).toEqual(expect.objectContaining(expectedProperties));
  })(cars);
  
});

test('POST /voitures should create a new car', async () => {
  const newCar = {
    couleur: 'Blue',
    marque: 'BMW'
  };

  const response = await axios.post('http://localhost:4000/voitures', newCar);

  expect(response.status).toBe(201); // Assuming 201 for successful creation

  // Ignorer la propriété `_id` lors de la comparaison
  const { _id, __v, ...expectedCar }: { couleur: string; marque: string; __v?: any; _id?: any} = newCar;

  expect(response.data).toEqual(expect.objectContaining(expectedCar));
});

