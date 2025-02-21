const { clearDatabase } = require('../../db.connection');
const request = require('supertest');
const app = require('../..');
const req = request(app);

describe('lab testing:', () => {
  describe('users routes:', () => {
    beforeAll(async () => {
      fakeUserOne = {
        name: 'Y3coub Kamr Eldin Debiazeh',
        email: 'Y3coub@example.com',
        password: 'Debiazeh',
      };
      await req.post('/user/signup').send(fakeUserOne);
      let loginRes = await req.post('/user/login').send(fakeUserOne);
      userToken = loginRes.body.data;

      fakeUserTwo = {
        name: 'Isma3il A7med Kanabawy',
        email: 'Isma3il@example.com',
        password: 'Kanabawy',
      };
      await req.post('/user/signup').send(fakeUserTwo);
      let loginRes2 = await req.post('/user/login').send(fakeUserTwo);
      userToken2 = loginRes2.body.data;

      fakeTask = {
        title: 'Finish the lab',
        description: "Sa3ten gad mn 3'er 4ay we y5lso",
      };
      let taskRes = await req
        .post('/todo')
        .send(fakeTask)
        .set({ authorization: userToken });
      todoId = taskRes.body.data._id;
    });

    // Note: user name must be sent in req query not req params
    it(`req to get(/user/search) ,
          expect to get the correct user with his name`, async () => {
      let res = await req.get('/user/search').query({ name: fakeUserOne.name });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe(fakeUserOne.name);
    });

    it(`req to get(/user/search) with invalid name ,
          expect res status and res message to be as expected`, async () => {
      let res = await req.get('/user/search').query({ name: 'Khalid Ka4miry' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(
        'There is no user with name: Khalid Ka4miry'
      );
    });
  });

  // ----------------------------------------------------------------------------------------

  describe('todos routes:', () => {
    it(`req to patch( /todo/:id) with id only ,
      expect res status and res message to be as expected`, async () => {
      let res = await req.patch(`/todo/${todoId}`).set({
        authorization: userToken,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('must provide title and id to edit todo');
    });

    it(`req to patch( /todo/) with id and title ,
      expect res status and res to be as expected`, async () => {
      let res = await req
        .patch(`/todo/${todoId}`)
        .send({ title: 'Finish the lab faster' })
        .set({ authorization: userToken });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe('Finish the lab faster');
    });

    it(`req to get( /todo/user) ,
      expect to get all user's todos`, async () => {
      let res = await req.get('/todo/user').set({ authorization: userToken });
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveSize(1);
    });
    it(`req to get( /todo/user) ,
      expect to not get any todos for user hasn't any todo`, async () => {
      let res = await req.get('/todo/user').set({ authorization: userToken2 });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("Couldn't find any todos for ");
    });
  });

  afterAll(async () => {
    await clearDatabase();
  });
});
