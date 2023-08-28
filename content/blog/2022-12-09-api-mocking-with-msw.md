---
title: "API mocking with MSW library"
date: 2022-12-09
toc: true
---

Ofthen when you're working on a frontend part of your application, there are
no implemented backend API yet, and you have to mock it.
In this article I'll tell how you can use the [MSW](https://mswjs.io) library
for it and why you should give it a try.

You can find all code in a [Github repository](https://github.com/cyevgeniy/msw-demo).

## Creating our demo

Our demo project is going to be a simple web application in vanilla javascript.
We will also use [Axios](https://axios-http.com) package for https requests and
[Vite](https://vitejs.dev) as a build tool.

At first, we need a skeleton for our application.
Luckily, vite can generate if for us. Go to the directory where you
plan to create a repository and run this command:

``` powershell
npm create vite@latest mswdemo -- --template vanilla
```

The `--template vanilla` flag tells vite to create template project
for vanilla javascript. Then, go to the `mswdemo` directory
and install all required packages:

``` powershell
npm install
```

Now we can run our dev server and see what we've got:

``` powershell
npm run dev
```

![](/img/vite_1.png)

We will create a service for displaying information about current user.
To get user data, we have to make an HTTP request to a server, but our
backend part is not implemented yet, so we will mock it. All what we need
for start is to know how our API will work - to which URL we need to
make request,which parameters it will expect and what kind of response it
will return.

### API

Here is the description of our API:

GET /user/:id - Returns our user data

User data is a JSON file with fields:

```
id
firstName
lastName
email
phone
registeredAt
```

## Creating app's main page

This topic is not about good design, so we'll create
very simple main page with the user information.

Vite's entry point is the `index.html` file.
By default, html is inserted into this file via `main.js` file.

We don't need any javascript interactions for now, so let's comment the line
where this file is included and create the html structure for our page:

``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- <script type="module" src="/main.js"></script> -->

    <h2> User information: </h2>
    <ul>
        <li id="firstName"> First name </li>
        <li id="lastName"> Last name </li>
        <li id="email"> Email </li>
        <li id="registered"> Registered at </li>
        <li id="login"> Login </li>
    </ul>
  </body>
</html>
```

If we run `npm run dev` command, our page will look like this:

![](/img/vite_2.png)

Now we want to fill this page with actual data. For the first time,
we're going to use one of the many online services - later you'll
see that MSW is better, but you should try both ways to see the
difference.

First, create the `api` directory. Inside this directory, create
a `userService.js` file:

``` javascript
export const getUserInfo = async () => {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1")
        const info = await response.json()
        return info
    } catch(e) {
        console.error("Error in getUserInfo: ", e)
        return null
    }
}
```

This file contains only one function - `getUserInfo`. It fetches
info about one single user.

It's also a good idea to let the user know that data is being loaded.
We will hide information block while data is loading and
show to the user another block with "Loading" text in it. When fetch
is finished, we will hide the "loading" block and show the "User info" block.

Here's the source of `index.html`:

``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>

    <div id="userInfo">
        <h2> User Information: </h2>
        <ul>
            <li id="firstName"> First name </li>
            <li id="lastName"> Last name </li>
            <li id="email"> Email </li>
            <li id="registered"> Registered at </li>
            <li id="login"> Login </li>
        </ul>
    </div>
    <div id="loading">
        Loading, please wait...
    </div>
  </body>
</html>
```

Let's add our logic. It's contained in the `main.js`:

``` javascript
import { getUserInfo } from "./api/userService"



const loadInfo = async () => {
    // Hide user info block
    document.getElementById('userInfo').hidden = true;

    // show "loading" block
    document.getElementById('loading').hidden = false;

    // Fetch user info
    const info = await getUserInfo()

    // Fill fields with user's data
    if (info) {
        document.getElementById('firstName').innerHTML = info.name
        document.getElementById('email').innerHTML = info.email
        document.getElementById('login').innerHTML = info.login

        // Hide loading state and show user info
        document.getElementById('userInfo').hidden = false
        document.getElementById('loading').hidden = true
    }
}

// Fetch user info
loadInfo()
```

Our page looks like this now:

![](/img/vite_3.png)

Not all fields filled with data, because fake API service doesn't provide
all what we need. And that's one of the downsides of online services.

## Some refactoring

Our `getUserinfo` can be better:

- accept user id as a  parameter (mandatory change)
- Base url for api call (https://jsonplaceholder.typicode.com)
  can be moved outside the `userService` module.

For the base url, we are going to use `.env` file.
Create it in the project's root directory:

``` javascript
VITE_BASE_URL="https://jsonplaceholder.typicode.com"
```

And here is a modified version of `getUserInfo`:

``` javascript
export const getUserInfo = async (id) => {
    try {
        const baseUrl = import.meta.env.VITE_BASE_URL
        const response = await fetch(baseUrl + `/users/${id}`)
        const info = await response.json()
        return info
    } catch(e) {
        console.error("Error in getUserInfo: ", e)
        return null
    }
}
```

And after that, we have to pass user's id to this function in the
`main.js` file:

``` javascript
....
// Fetch user info
const info = await getUserInfo(2)
...
```

Now, I think it's enough for our test project. Here, we have
some problems:

- Base URL for our app is faked. We have to change it every time
  we debug or test our app or write separate logic for handling
  two different URLs (for production and development).
- We can't control what data is returned. Third-party mock API may
  lack of required fields or response's structure.
- We can't control **behaviour**. For example, some of our `DELETE` calls should
  be forbidden depending on some rules and we want to write frontend part
  that handles this logic.

## MSW framework

[MSW](https://mswjs.io/docs/) is a library for mocking API responses.
It can handle *REAL* https calls and return any data you want for them.
It means that if your api isn't implemented yet, or even if you have
no access to the internet, you can use it like if your app is talking to
the real backend server.

First of all, let's install it:

```
npm i msw --save-dev
```

Then, create `mocks` directory and create a `handlers.js` file inside it.
This file will contain handlers for our https calls that return
mock data:

```js
// src/mocks/handlers.js
import { rest } from 'msw'
export const handlers = [
  // Handles a POST /login request
  rest.post('/login', null),
  // Handles a GET /user request
  rest.get('/user', null),
]
```

So, basically, all we need to do is to return mock
data through these handlers. When our application sends HTTP requests, our
handler catches them. Then, it processes all matched requests and responds
with mocked data. All unprocessed requests are sent further. Let's write our
handler for the `/user/:id` request:

```js
// src/mocks/handlers.js
import { rest } from 'msw'

export const handlers = [
    rest.get('https://mydomain.com/users/:id', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                firstName: "John",
                lastName: "Doe",
                registered: "2022-02-01",
                login: "john_doe_123",
                email: "johndoe@mailcomain.com"
            }),
        )
    }),
]
```

As was told before, the nice thing here is that we can send
responses with the structure that we exactly need.

Now, we can change the `VITE_BASE_URL` variable in our
`.env` file to `https://mydomain.com` (It may be anything, actually,
you can put here your *real* url).

The last thing we need to do is to register a Service Worker
for requests interception. The MSW library can create it for
us. Run this command:

``` js
npx msw init public --save
```

Then, create a `/mocks/browser.js` file:

``` js
// src/mocks/browser.js
import { setupWorker } from 'msw'
import { handlers } from './handlers'
// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers)
```

This file setups service workers with our route handlers from the `handlers.js` file.

Now, open `main.js` file and import our `worker` from the `browser.js` module:

``` js
import { worker } from "./mocks/browser"
```

Then, add following code:

``` js
// Start service workers
if (process.env.NODE_ENV === "development") {
    worker.start();
}
```

Important notice - we should run our worker only in development mode,
because we don't want it  to intercept our request in production.

Finally, since now we have full data structure that we need, modify
`loadInfo` function:

``` js
const loadInfo = async () => {
    // Hide user info block
    document.getElementById('userInfo').hidden = true;

    // show "loading" block
    document.getElementById('loading').hidden = false;

    // Fetch user info
    const info = await getUserInfo(2)

    // Fill fields with user's data
    if (info) {
        document.getElementById('firstName').innerHTML = info.firstName
        document.getElementById('lastName').innerHTML = info.lastName


        document.getElementById('email').innerHTML = info.email
        document.getElementById('login').innerHTML = info.login

        document.getElementById('registered').innerHTML = info.registered

        // Hide loading state and show user info
        document.getElementById('userInfo').hidden = false
        document.getElementById('loading').hidden = true
    }
}
```

That's all. Run `npm run dev` and open console (`F12` key). We should
see the message:

``` js
[MSW] Mocking enabled.
```

As you can see, our page now shows user data from our mock handler:


![](/img/vite_4.png)

One more thing - we haven't took into account user id that we
pass to `getUserInfo`. With msw, it's easy to get access to route parameters:

``` js
//src/mocks/handlers.js
import { rest } from 'msw'

function User(id) {
    this.firstName = "John_" + id
    this.lastName = "Doe_" + id
    this.registered = "2022-02-01"
    this.login = "john_doe_" + id
    this.email = this.login + "@maildomain.com"
}

export const handlers = [
    rest.get('https://mydomain.com/users/:id', (req, res, ctx) => {

        const { id } = req.params // Get user id

        return res(
            ctx.status(200),
            ctx.json(
                // And generate different mock data for different users
                new User(id)
            ),
        )
    }),
]
```
