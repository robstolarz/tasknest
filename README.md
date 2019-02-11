# tasknest
a nested-task-keeping tool

<a href="http://www.youtube.com/watch?feature=player_embedded&v=3w2p6sV3cFc" target="_blank">see video</a>

## intent
Most todo apps don't allow you to store tasks with more than one level of nesting. I feel like being able to do that unlocks new possibilities in accurately breaking down tasks into their smallest components.

I'd also like to explore a more focused view that allows users to view incomplete child tasks in a Kanban board.

I made this mostly as a testbed for React and k8s, so I can get some more practice with both in a public setting. But I've also always wanted a tool like this. It should be fun.

## status
It can be deployed and has some functionality.

Until it's actually useful, I'll use GitHub Issues as the issue tracker.

## running it

### as a developer

open three terminals.

in the first terminal, get the frontend ready:
```sh
cd frontend
npm install
npm run start
```
you can visit it on port 3000, but it will probably break immediately. this is a good sign.

in the second terminal, get the backend ready:
* `cd backend`
* install PostgreSQL and start it
* create a new database with `CREATE DATABASE tasknest;` and switch to it with `\c tasknest`
* create a new role with `CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'some-password';`
* install sql-migrate with `go get -v github.com/rubenv/sql-migrate/...` (the `...` must be present) and run `sql-migrate up`
* grant this role to a role called `web_anon` with `GRANT web_anon TO authenticator;`
* install PostgREST and run it with `postgrest postgrest.dev.conf`

test if it works on port 3001. feel free to also do `psql -d tasknest < seeds/*` to seed the database.

in the last terminal, run nginx:
```sh
cd backend
nginx -p . -c nginx.dev.example.conf
```
the entire app should be available on port 3002.

### in production

do something similar to the above, but instead of running the frontend dev server, build a bundle and pass it off to your system nginx instance to serve.

not that this is currently advisable, because i'll probably move it to a k8s-based deployment method eventually.
