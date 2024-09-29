const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

let testFranchise;
let adminUser;
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

beforeAll(async () => {
    adminUser = await createAdminUser();
    testFranchise = {
        name: 'pizzaPocket',
        admins: [{ email: 'admin@jwt.com' }]
      };
    const response = await request(app)
    .post('/api/auth/login')
    .send({ email: adminUser.email, password: adminUser.password });
  
    adminUser.authToken = response.body.token;
  });

test('getAllFranchises', async () => {
    const getAllFranchise = await request(app).get('/api/franchise');
    expect(getAllFranchise.status).toBe(200);
    expect(Array.isArray(getAllFranchise.body)).toBeTruthy();
});

test('getUserFranchises', async () => {
    const getFranchise = await request(app).get(`/api/franchise`).set('Authorization', `Bearer ${adminUser.authToken}`);
    console.log(getFranchise.body)
});

test('createFranchise', async () => {
    const createFranchise = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminUser.authToken}`).send(testFranchise);
    console.log(createFranchise.body)
})