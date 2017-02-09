$(document).ready(function() {
  $('.button-collapse').sideNav()

  var submitVote = document.querySelectorAll('#submit-vote')
  var deletePoll = document.querySelectorAll('.delete-poll')

  if (submitVote) {
    submitVote.forEach( function(button) {
      button.addEventListener('click', function() {
        this.parentNode.parentNode.querySelector('form').submit()
      })
    })
  }

  if (deletePoll) {
    deletePoll.forEach( function(link) {
      link.addEventListener('click', function() {
        console.log(this)
        this.parentNode.querySelector('form').submit()
      })
    })
  }

})
