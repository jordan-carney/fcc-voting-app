$(document).ready(function() {
  $('.button-collapse').sideNav()

  document.querySelector('#submit-vote').addEventListener('click', function() {
    this.parentNode.parentNode.querySelector('form').submit()
  })

})
