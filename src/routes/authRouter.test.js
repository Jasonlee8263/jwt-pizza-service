const { Role, DB } = require('../database/database.js');
const request = require('supertest');
const app = require('../service');

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  await DB.addUser(user);

  user.password = 'toomanysecrets';
  return user;
}

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  // console.log(registerRes.body)
  testUserAuthToken = registerRes.body.token;
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
});

// test('Authenticate token', () => {

// })

test('logout', async () => {
  const logoutRes = await request(app).delete('/api/auth').send(testUser).set('Authorization', `Bearer ${testUserAuthToken}`)
  // console.log(logoutRes.body)
  expect(logoutRes.status).toBe(200);
})

// test('update user', async () => {
//   const updateRes = await request(app).put('/api/auth/1').send(testUser).set('Authorization', `Bearer ${testUserAuthToken}`)
//   console.log(updateRes.body)
//   expect(updateRes.status).toBe(200)
// })