# Free Code Camp - Voting app

**Demo**
https://jc-fcc-vote.herokuapp.com/

## TODO
- [x] Setup User Authentication
  - [x] Client Sessions
  - [x] Cookies (security concerns)
  - [x] Hash Passwords
  - [x] Cross-Site Request Forgery defense
  - [x] SSL (Heroku?)
  - [x] Login Page
  - [x] Logout Page
  - [x] Register Page
- [x] Setup Mongo/Mongoose
- [x] Ensure user password hash is not sent to front end
- [x] Add endpoint for front-end to fetch poll-results data
- [ ] As an authenticated user, I can delete my account
- [x] As an authenticated user, I can edit any of my existing polls
- [x] As an unauthenticated or authenticated user, I can only vote once in a poll

## User Stories
- [x] As an authenticated user, I can keep my polls and come back later to access them.
- [x] As an authenticated user, I can share my polls with my friends.
- [x] As an authenticated user, I can see the aggregate results of my polls.
- [x] As an authenticated user, I can delete polls that I decide I don't want anymore.
- [ ] As an authenticated user, I can create a poll with any number of possible items.
- [ ] As an unauthenticated or authenticated user, I can see and vote on everyone's polls.
- [x] As an unauthenticated or authenticated user, I can see the results of polls in chart form. (This could be implemented using Chart.js or Google Charts.)
- [ ] As an authenticated user, if I don't like the options on a poll, I can create a new option.
