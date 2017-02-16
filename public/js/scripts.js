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

  const pollId = document.querySelector('#test').getAttribute('data-src')

  fetch('/api/poll-results/' + pollId)
    .then( response => response.json() )
    .then( data => graphResults(data) )

  function graphResults(data) {
    const ctx = document.getElementById("test")
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.options.map( option => option.title ),
            datasets: [{
                label: '# of Votes',
                data: data.options.map( option => option.votes ),
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    })
  }

})
