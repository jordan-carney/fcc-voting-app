$(document).ready(function() {
  $('.button-collapse').sideNav()

  const submitVote = document.querySelectorAll('#submit-vote')
  const editPoll = document.querySelectorAll('.edit-poll')
  const deletePoll = document.querySelectorAll('.delete-poll')

  if (submitVote) {
    submitVote.forEach( function(button) {
      button.addEventListener('click', function() {
        this.parentNode.parentNode.querySelector('form').submit()
      })
    })
  }

  if (editPoll) {
    editPoll.forEach( function(link) {
      link.addEventListener('click', function() {
        const form = this.parentNode.querySelector('form')
        form.action = '/edit-poll'
        form.submit()
      })
    })
  }

  if (deletePoll) {
    deletePoll.forEach( function(link) {
      link.addEventListener('click', function() {
        const form = this.parentNode.querySelector('form')
        form.action = '/delete-poll'
        form.submit()
      })
    })
  }

})
