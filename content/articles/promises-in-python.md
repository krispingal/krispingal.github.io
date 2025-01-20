+++
date = '2024-12-31'
draft = false
title = 'Promises in Python'
keywords = ['Python concurrency', 'Python Promises']
tags = ['Concurrency', 'python']
categories = ['ppl']
description = "What makes JavaScript Promises so powerful, and how can we replicate their magic in Python? Follow this journey from JavaScript’s then and catch to Python’s asyncio, and uncover the pros, cons, and alternative approaches along the way."
+++

## What Are Promises?

In JavaScript, Promises are objects that represent the eventual completion (or failure) of an asynchronous operation and its resulting value. They provide a powerful way to manage asynchronous code, enabling developers to write cleaner and more maintainable logic.

Promises allow us to associate handlers for both the success and failure of an asynchronous operation. By treating asynchronous code similarly to synchronous code, they reduce the complexity and improve the readability of workflows that would otherwise be riddled with convoluted callbacks—commonly referred to as "callback hell."

<!--more-->
With Promises, you can chain operations seamlessly using `.then` for successful resolution and `.catch` for error handling. Here's an example in JavaScript:

``` javascript
myPromise
  .then((value) => `${value} and bar`)
  .then((value) => `${value} and bar again`)
  .then((value) => `${value} and again`)
  .then((value) => {
    console.log(value);
  })
  .catch((err) => {
    console.error(err);
  });
```

In this example, the chain begins with myPromise. If myPromise resolves to the string "Timon", the output on the console would be:
`Timon and bar and bar again and again`.

Promises simplify the orchestration of sequential and dependent asynchronous operations, making them an essential feature for modern JavaScript development.

--------------

## Breaking Down a Promise

A Promise operates as a container for an asynchronous operation and its eventual result. To understand how Promises work, we can break them into two main parts:

1. **The Executor Function**: This is the method that performs the main asynchronous operation. It takes two callbacks: resolve, which is invoked on success, and reject, which is invoked on failure.
2. **Callback Handlers**: Promises allow chaining of operations with two categories of callbacks:
    *Resolve Callbacks (then)*: These are executed after the main asynchronous operation completes successfully.
    *Reject Callbacks (catch)*: These handle errors or failures in the asynchronous operation.

Promises make it possible to execute a series of asynchronous steps in sequence or handle errors gracefully, all while maintaining cleaner, more readable code.

-------------------

## A Python Implementation of Promises

Let’s look at a small implementation of Promises in Python using asyncio:

```python
import asyncio

class Promise:
    def __init__(self, executor):
        self._then_callbacks = []
        self._catch_callbacks = []

        async def _exec():
            try:
                await executor(self._resolve, self._reject)
            except Exception as e:
                await self._reject(e)

        asyncio.create_task(_exec())

    async def _resolve(self, value):
        for callback in self._then_callbacks:
            try:
                await self._handle_callback(callback, value)
            except Exception as e:
                await self._reject(e)

    async def _reject(self, error):
        for callback in self._catch_callbacks:
            try:
                await self._handle_callback(callback, error)
            except Exception as e:
                print(f"Error in reject callback: {e}")

    async def _handle_callback(self, callback, value):
        return await callback(value)

    def then(self, callback):
        self._then_callbacks.append(callback)
        return self

    def catch(self, callback):
        self._catch_callbacks.append(callback)
        return self
```

Key Features of This Implementation:

1. **Executor Function**: The `executor` is passed to the `Promise` constructor and is expected to perform an asynchronous operation. It calls `self._resolve` on success and `self._reject` on failure.
2. **Chaining with** `then` **and** `catch`: Both methods append callbacks to their respective lists and return `self`, enabling method chaining similar to JavaScript Promises.
3. **Error Handling**: Any exception raised during the execution or callbacks is passed to the reject chain for graceful error handling.

This implementation mirrors the behavior of JavaScript Promises in Python using `asyncio`, providing a clean and intuitive way to handle asynchronous workflows.

--------

## A Working Example with Promises

In the previous section, we explored a Python implementation of Promises. Now, let’s see it in action with a real-world example. We’ll perform an asynchronous operation to fetch a post from [dummyjson.com](https://dummyjson.com/). The fetching logic will be wrapped within the Promise executor, and we’ll attach `then` (resolve) and `catch` (reject) handlers to manage success and failure scenarios.


``` python
import aiohttp

def fetch_post(post_id: int):
    async def executor(resolve, reject):
        async with aiohttp.ClientSession() as session:
            try:
                url = f"https://dummyjson.com/posts/{post_id}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        await resolve(data)
                    else:
                        await reject(f"HTTP Error: {response.status}")
            except Exception as e:
                await reject(e)

    return Promise(executor)


async def main():
    done = asyncio.Future()

    async def handle_result(post):
        print(f"Post title: {post['title']}")
        print(f"Post body: {post['body']}")
        done.set_result(None)

    async def handle_error(error):
        print(f"Got error: {error}")
        done.set_result(None)

    # Test success case with post id 1
    promise = fetch_post(1)
    promise.then(handle_result).catch(handle_error)
    await done

    # Reset future for error case
    done = asyncio.Future()

    # Test error case with invalid post id
    promise = fetch_post(999999)  # Non-existent post
    promise.then(handle_result).catch(handle_error)
    await done

if __name__ == "__main__":
    asyncio.run(main())

```

### Explanation

1. **The** `fetch_post` **Function**: This function creates a Promise that fetches a post from the API endpoint.
On a successful response (`status == 200`), it calls the `resolve` function with the fetched data.
On failure, such as an HTTP error or network issue, it calls the `reject` function with an error message.
2. **The `main` Coroutine**:
It tests both success and failure cases using two Promise instances.
`then` is used to process the result when the Promise resolves successfully, and `catch` handles errors gracefully.
3. **Testing Success and Failure Scenarios**:
In the success case, fetching a valid post (e.g., `post_id`=1) prints the post title and body.
In the failure case, attempting to fetch a non-existent post (e.g., `post_id=999999`) triggers the error handler and prints an error message.
4.**Chaining with `then` and `catch`**: The Promise implementation supports chaining, enabling a clean and readable flow for asynchronous tasks.

----

## Alternative Pythonic Way of Completing the Task

While implementing a Promise system in Python is an interesting exercise, it's worth noting that Python has built-in support for asynchronous programming with async/await. Using coroutines and asyncio utilities is the more Pythonic approach and avoids reinventing the wheel.

Let’s revisit the same task of fetching posts from dummyjson.com, but this time using Python’s native async programming idioms:

```python
import asyncio
import aiohttp

POSTS = "https://dummyjson.com/posts"


async def fetch_post_title(session: aiohttp.ClientSession, id: int):
    try:
        async with session.get(f"{POSTS}/{id}") as response:
            if response.status == 200:
                data = await response.json()
                return data
            else:
                raise ValueError(f"HTTP Error: {response.status}")
    except Exception as e:
        # This is like the "catch" part of our Promise
        print(f"Error fetching post {id}: {str(e)}")
        return None


async def process_post(post):
    # This is like our "then" callback
    if post:
        print(f"Title: {post['title']}")
        print(f"Body: {post['body']}")
    return post


async def main(num_posts=10):
    async with aiohttp.ClientSession() as session:
        # Create tasks for fetching posts
        fetch_tasks = [fetch_post_title(session, i) for i in range(1, num_posts + 1)]

        # Fetch all posts
        posts = await asyncio.gather(*fetch_tasks, return_exceptions=True)

        # Process posts (equivalent to our "then" chain)
        process_tasks = [process_post(post) for post in posts if post is not None]
        await asyncio.gather(*process_tasks)


if __name__ == "__main__":
    asyncio.run(main())

```

### Explanation

1. **Direct Coroutines**:
    - `fetch_post_title` fetches a post asynchronously, raising an exception if the request fails. This is functionally similar to the `Promise` executor.
2. **Error Handling**:
    - Errors are caught within `fetch_post_title` using a `try-except` block, much like the catch handler in the Promise implementation.
3. **Processing Results**:
    - The `process_post` coroutine handles the fetched post data, mirroring the `then` chain functionality.
4. **Concurrent Execution**:
    - The `asyncio.gather` function is used to execute fetch and process tasks concurrently, avoiding the need for manual chaining or custom Promise logic.
5. **Comparison with Promises**:
    - This approach directly leverages Python’s async programming model, resulting in less boilerplate and a cleaner, more idiomatic codebase.
    - Instead of chaining methods (`then`, `catch`), coroutines are structured as discrete steps, making the control flow explicit.

### A Note on Alternatives: `ThreadPoolExecutor` vs. `aiohttp`
While this post focuses on implementing Promises in Python and showcasing asynchronous programming with `aiohttp`, it's worth noting that similar functionality can be achieved using `ThreadPoolExecutor` with the `requests` library.

The ThreadPoolExecutor approach is more familiar to Python developers who haven't worked extensively with `asyncio`. However, it may not provide significant performance improvements over `aiohttp` for handling many HTTP requests due to thread overhead. Here’s an example:

```python
from concurrent.futures import ThreadPoolExecutor
import requests

POSTS = "https://dummyjson.com/posts"


def fetch_post(post_id: int):
    try:
        response = requests.get(f"{POSTS}/{post_id}")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching post {id}: {str(e)}")
        return None

def process_post(post):
    if post:
        print(f"Title: {post['title']}")
        print(f"Body: {post['body']}")
    return post

def main(num_posts=10):
    with ThreadPoolExecutor() as executor:
        # Fetch posts concurrently
        post_ids = range(1, num_posts + 1)
        results = list(executor.map(fetch_post, post_ids))

        # Process posts (equivalent to our "then" chain)
        for post in results:
            process_post(post)


if __name__ == "__main__":
    main()
```

This alternative doesn't rely on aiohttp or Python's `asyncio` event loop, making it simpler to understand and implement. However, for high-concurrency tasks, `aiohttp` typically offers better performance by avoiding thread management overhead.
