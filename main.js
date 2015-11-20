// Author: Brandon Cheng
// Class: Physics for Engineers 1501Q
// Professor: Fedor Bezrukov
// Date: 2015 11-19

var data = {
  datasets: [{
    borderColor : "rgba(151,187,205,1)",
    pointBackgroundColor : "rgba(151,187,205,1)",
    fill: false,
    data: []
  }]
};

var graphOptions = {
  responsive: true,
  scales: {
    xAxes: [{
      scaleLabel: { show: true, labelString: 'Time (s)' },
      ticks: { suggestedMin: 0, suggestedMax: Number($('#t_f').val()) }
    }],
    yAxes: [{
      scaleLabel: { show: true, labelString: 'Distance (m)' },
      ticks: { suggestedMin: -Number($('#x_0').val()), suggestedMax: Number($('#x_0').val()) }
    }]
  }
}

var ctx = document.getElementById('canvas').getContext('2d');
graph = Chart.Scatter(ctx, { data: data, options: graphOptions });

function startSimulation() {
  // Clear previously plotted data
  data.datasets[0].data = [];
  $('#text-coordinates').val('');

  // Set initial conditions
  var x = Number($('#x_0').val());
  var v = Number($('#v_0').val());
  var t_f = Number($('#t_f').val());
  var dt = Number($('#dt').val());

  var k = Number($('#k').val());
  var m = Number($('#m').val());
  var g = Number($('#g').val());
  var l = Number($('#l').val());

  // Function for acceleration of a spring oscillator
  function springOscillator(x) {
    return -k/m * x;
  }

  // Function for the acceleration of a simple oscillator with an arbitrary angle
  function simpleOscillatorWithArbitraryAngle(x) {
    return -g/l * Math.sin(x);
  }

  // Setup the oscillator chosen
  if ($('#springOscillator').is(':checked')) {
    var f = springOscillator;
    var omegaSquared = k/m;
  } else if ($('#simpleOscillatorWithArbitraryAngle').is(':checked')) {
    var f = simpleOscillatorWithArbitraryAngle;
    var omegaSquared = g/l;
  }

  // We can find the period of the oscillation by taking the time it takes for
  // the sign of the velocity to change and dividing it by 2.
  var isVelocityPositive = null; // This starting value will be overrided
  var numberOfVelocitySignChanges = 0;
  var timeOfFirstVelocitySignChange = 0;
  var timeOfSecondVelocitySignChange = 0;

  if (v === 0) {
    // If velocity is zero at the beginning, we can think of it as if it just
    // changed
    numberOfVelocitySignChanges++;
  }

  var t = 0;
  for (var i = 0; t <= t_f; i++) {
    var roundedTime = t.toFixed(4);
    var roundedDistance =  x.toFixed(4);
    var roundedVelocity = v.toFixed(4);

    // Add coordinates to textarea output
    var readOut = roundedTime + "\t" + roundedDistance + "\t" + roundedVelocity;
    var textarea = $('#text-coordinates');
    var previousCoordinates = textarea.val();
    textarea.val(previousCoordinates + readOut + "\n");

    // Add every 10th point to the graph
    if (i % 10 === 0) {
      data.datasets[0].data.push({x: roundedTime, y: roundedDistance});
    }

    // Update the motion of the object using Euler's method
    var a = f(x);
    x = x + v*dt;
    v = v + a*dt;
    t += dt;

    // Check if the sign of velocity changed.
    if (i > 0) {
      var isCurrentVelocityPositive = Math.sign(v) > 0;
      if (isVelocityPositive !== isCurrentVelocityPositive) {
        if (numberOfVelocitySignChanges == 0) {
          timeOfFirstVelocitySignChange = t;
        } else if (numberOfVelocitySignChanges == 1) {
          timeOfSecondVelocitySignChange = t;
        }
        numberOfVelocitySignChanges++;
      }
    }
    isVelocityPositive = Math.sign(v) > 0;
  };

  graph.update();
  var T = 2 * (timeOfSecondVelocitySignChange - timeOfFirstVelocitySignChange);
  $('#angularFrequency').text(Math.sqrt(omegaSquared).toFixed(5));
  $('#period').text(T.toFixed(5));
  $('#tomega').text(Number(T*Math.sqrt(omegaSquared)).toFixed(5));
}
