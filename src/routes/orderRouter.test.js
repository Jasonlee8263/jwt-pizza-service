const { Role, DB } = require('../database/database.js');
const request = require('supertest');
const app = require('../service');
let testMenu;
let adminUser;
// let testOrder;
// let userId;
function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }
  async function createAdminUser() {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';
    await DB.addUser(user);
    // const response = await DB.addUser(user);
    // userId = response.id
  
    user.password = 'toomanysecrets';
    return user;
  }
beforeAll(async ()=> {
    testMenu = { title:"Student", description: "No topping, no sauce, just carbs", image:"pizza9.png", price: 0.0001 }
    adminUser = await createAdminUser();
    const response = await request(app)
    .put('/api/auth')
    .send({ email: adminUser.email, password: adminUser.password });  
    adminUser.authToken = response.body.token;
    // testOrder = {franchiseId: 1, storeId:1, items:[{ menuId: 1, description: "Veggie", price: 0.05 }]}
})

test('Add menu item', async () => {
    const addMenuItemRes = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${adminUser.authToken}`).send(testMenu)
    expect(addMenuItemRes.status).toBe(200);
})

test('get menu item', async () => {
    const getMenuRes = await request(app).get('/api/order/menu')
    expect(getMenuRes.status).toBe(200)
})

test('Get order', async () => {
    const getOrderRes = await request(app).get("/api/order").set('Authorization', `Bearer ${adminUser.authToken}`)
    expect(getOrderRes.status).toBe(200)
})

// test('Create order', async () => {
//     // const body = {diner: {id: userId, name: adminUser.name, email: adminUser.email}, testOrder}
//     // console.log(body)
//     const createOrderRes = await request(app).post('/api/order').set('Authorization', `Bearer ${adminUser.authToken}`).send(testOrder)
//     console.log(createOrderRes.body)
//     expect(createOrderRes.status).toBe(200);
// })