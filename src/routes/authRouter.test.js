const { Role, DB } = require('../database/database.js');
const request = require('supertest');
const app = require('../service');
function randomName() {
  return Math.random().toString(36).substring(2, 12);
}
async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  await DB.addUser(user);

  user.password = 'toomanysecrets';
  return user;
}

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let adminUser;
let testUserAuthToken;
let testUserId;

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  testUserId = registerRes.body.user.id
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

test('update user', async () => {
  adminUser = await createAdminUser();
  const loginRes = await request(app)
    .put('/api/auth')
    .send({ email: adminUser.email, password: adminUser.password });  
    adminUser.authToken = loginRes.body.token;
  const updateRes = await request(app).put(`/api/auth/${testUserId}`).send(testUser).set('Authorization', `Bearer ${adminUser.authToken}`)
  expect(updateRes.status).toBe(200)
})