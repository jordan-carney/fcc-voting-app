$(document).ready(() => {
  $('.button-collapse').sideNav()

  const submitVote = document.querySelectorAll('#submit-vote')
  const editPoll = document.querySelectorAll('.edit-poll')
  const deletePoll = document.querySelectorAll('.delete-poll')

  if (submitVote) {
    submitVote.forEach((button) => {
      button.addEventListener('click', function () {
        this.parentNode.parentNode.querySelector('form').submit()
      })
    })
  }

  if (editPoll) {
    editPoll.forEach((link) => {
      link.addEventListener('click', function () {
        const form = this.parentNode.querySelector('form')
        form.action = '/edit-poll'
        form.submit()
      })
    })
  }

  if (deletePoll) {
    deletePoll.forEach((link) => {
      link.addEventListener('click', function () {
        const form = this.parentNode.querySelector('form')
        form.action = '/delete-poll'
        form.submit()
      })
    })
  }

  if (window.location.pathname === '/account') {
    const deleteAccount = document.querySelector('#delete-account')
    if (deleteAccount) {
      deleteAccount.addEventListener('click', () => {
        const form = document.querySelector('form')
        form.action = '/account'
        form.submit()
      })
    }
  }

  // Add/Remove Options during poll creation and editing
  if (window.location.pathname === '/create-poll' || window.location.pathname.includes('/edit-poll')) {
    const addOption = document.querySelector('#addOption')
    const delOption = document.querySelector('#delOption')

    if (document.querySelectorAll('.option').length <= 2) delOption.classList.add('hide')

    addOption.addEventListener('click', () => {
      const options = document.querySelectorAll('.option')
      if ((options.length + 1) === 10) addOption.classList.add('hide')
      if (options.length < 10) {
        delOption.classList.remove('hide')
        const lastOption = options[options.length - 1]
        const newOption = lastOption.cloneNode(true)
        newOption.querySelector('input').value = ''
        lastOption.after(newOption)
      }
    })

    delOption.addEventListener('click', () => {
      const options = document.querySelectorAll('.option')
      if (options.length > 2) {
        addOption.classList.remove('hide')
        const lastOption = options[options.length - 1]
        lastOption.parentNode.removeChild(lastOption)
      }
      if ((options.length - 1) === 2) delOption.classList.add('hide')
    })
  }

  // Render bar chart for poll results
  const polls = document.querySelectorAll('.poll-results')

  function graphResults(data, poll) {
    const myChart = new Chart(poll, {
      type: 'bar',
      data: {
        labels: data.options.map(option => option.title),
        datasets: [{
          label: '# of Votes',
          data: data.options.map(option => option.votes),
          backgroundColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
        }],
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 1,
            },
          }],
        },
      },
    })
  }

  if (polls && polls.length) {
    polls.forEach((poll) => {
      const pollId = poll.getAttribute('data-src')

      fetch(`/api/poll-results/${pollId}`)
        .then(response => response.json())
        .then(data => graphResults(data, poll))
    })
  }
})
