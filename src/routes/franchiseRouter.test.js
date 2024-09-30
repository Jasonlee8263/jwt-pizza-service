const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

let testFranchise;
let adminUser;
let franchiseId;
let userId;
let testStore;
let storeId;
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
    // const createFranchise = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminUser.authToken}`).send(testFranchise);
    // franchiseId = createFranchise.body.id
    // testStore = {
    //     franchiseId: franchiseId,
    //     name: randomName()
    // };
  });
beforeEach(async () => {
    const createFranchise = await request(app).post('/api/franchise').set('Authorization', `Bearer ${adminUser.authToken}`).send(testFranchise);
    franchiseId = createFranchise.body.id
    testStore = {
        franchiseId: franchiseId,
        name: randomName()
    };
})
afterEach(async () => {
    await request(app).delete(`/api/franchise/${franchiseId}`).set('Authorization', `Bearer ${adminUser.authToken}`);
})

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
test('Unauthorized user delete franchise', async () => {
    const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
    const registerRes = await request(app).post('/api/auth').send(testUser);
    let testUserAuthToken = registerRes.body.token;
    const deleteFranchise = await request(app).delete(`/api/franchise/${franchiseId}`).set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(deleteFranchise.status).toBe(403)
})


test('Unauthorized user create franchise', async () => {
    const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
    const registerRes = await request(app).post('/api/auth').send(testUser);
    let testUserAuthToken = registerRes.body.token;
    const createFranchise = await request(app).post('/api/franchise').set('Authorization', `Bearer ${testUserAuthToken}`).send(testFranchise);
    expect(createFranchise.status).toBe(403)
})

test('Create new franchise store', async () => {
    const createStore = await request(app).post(`/api/franchise/${franchiseId}/store`).set('Authorization', `Bearer ${adminUser.authToken}`).send(testStore);
    storeId = createStore.body.id
    expect(createStore.status).toBe(200);
})

test('Unauthorized user create store', async () => {
    const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
    const registerRes = await request(app).post('/api/auth').send(testUser);
    let testUserAuthToken = registerRes.body.token;
    const createStore = await request(app).post(`/api/franchise/${franchiseId}/store`).set('Authorization', `Bearer ${testUserAuthToken}`).send(testStore);
    expect(createStore.status).toBe(403)
})

test('Delete store', async () => {
    const deleteStore = await request(app).delete(`/api/franchise/${franchiseId}/store/${storeId}`).set('Authorization', `Bearer ${adminUser.authToken}`);
    // console.log(deleteFranchise.body)
    expect(deleteStore.status).toBe(200);
    expect(deleteStore.body.message).toBe("store deleted")
});

test('Unauthorized user delete store', async () => {
    const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
    const registerRes = await request(app).post('/api/auth').send(testUser);
    let testUserAuthToken = registerRes.body.token;
    const deleteStore = await request(app).delete(`/api/franchise/${franchiseId}/store/${storeId}`).set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(deleteStore.status).toBe(403)
})