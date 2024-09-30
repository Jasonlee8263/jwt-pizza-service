const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

let testFranchise;
let adminUser;
let franchiseId;
let userId;
function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  const response = await DB.addUser(user);
  userId = response.id

  user.password = 'toomanysecrets';
  return user;
}

beforeAll(async () => {
    adminUser = await createAdminUser();
    testFranchise = {
        name: randomName(),
        admins: [{ email: adminUser.email }]
      };
    const response = await request(app)
    .put('/api/auth')
    .send({ email: adminUser.email, password: adminUser.password });  
    adminUser.authToken = response.body.token;
    const createFranchise = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminUser.authToken}`).send(testFranchise);
    franchiseId = createFranchise.body.id
  });

test('Get all franchises', async () => {
    const getAllFranchise = await request(app).get('/api/franchise');
    expect(getAllFranchise.status).toBe(200);
    expect(Array.isArray(getAllFranchise.body)).toBeTruthy();
});

test('Get user franchises', async () => {
    const getFranchise = await request(app).get(`/api/franchise/${userId}`).set('Authorization', `Bearer ${adminUser.authToken}`);
    expect(getFranchise.status).toBe(200);
    expect(Array.isArray(getFranchise.body)).toBeTruthy();
});

test('Delete user franchises', async () => {
    const deleteFranchise = await request(app).delete(`/api/franchise/${franchiseId}`).set('Authorization', `Bearer ${adminUser.authToken}`);
    expect(deleteFranchise.status).toBe(200);
    expect(deleteFranchise.body.message).toBe("franchise deleted")
});

// test('Create new franchise store', async () => {
//     const createStore = await request(app).post(`/api/franchise/${franchiseId}/store`).set('Authorization', `Bearer ${adminUser.authToken}`).send(testFranchise);
//     console.log(createStore.body)
// })