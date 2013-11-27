describe('idleTimer', function(){

  beforeEach(function() {
    this.addMatchers({
      toBeAFunction: function() {
        return _.isFunction(this.actual);
      },
      toBeAnObject: function() {
        return _.isObject(this.actual)
      }
    });
  });

  it('should be defined', function(){
    expect(idleTimer).toBeDefined();
  });

  it('should be instantiable', function(){
    var timer = new idleTimer();
    expect(timer).toBeAnObject();
  });

});

describe('idleTimer instance', function() {

  beforeEach(function() {
    this.addMatchers({
      toBeAFunction: function() {
        return _.isFunction(this.actual);
      },
      toBeAnObject: function() {
        return _.isObject(this.actual)
      }
    });
  });

  var timer = new idleTimer();

  it('should have a default interval of 1 minute', function() {
    expect(timer.interval).toBe(60*1000);
  });

  it('should have a default maxIdleTime of 20 minutes', function() {
    expect(timer.maxIdleTime).toBe(20*60*1000);
  });  

  it('should have a default onTimeExceeded function', function() {
    expect(timer.onTimeExceeded).toBeAFunction();
  });    

  it('should have a default onNewActivity function', function() {
    expect(timer.onNewActivity).toBeAFunction();
  });      

  it('instances should have an incrementTimer method', function() {
    expect(timer.incrementTimer).toBeAFunction();
  });  

  it('.incrementTimer() should always increase the amount of time spent idle by the interval between checks.', function() {
    timer.timeSpentIdle = 1;
    timer.incrementTimer();
    expect(timer.timeSpentIdle).toBe((1+timer.interval));
  });

  it("when calling .incrementTimer() increases the timeSpentIdle past the maxIdleTime, it should change the timer's state to 'watching_for_new_activity'.", function() {
    timer.timeSpentIdle = timer.maxIdleTime - 1;
    timer.state = "not_set";
    timer.incrementTimer();
    expect(timer.state).toBe("watching_for_new_activity");
  });

  it("when calling .incrementTimer() increases timeSpentIdle past maxIdleTime, it should change call timer.onTimeExceeded", function() {
    timer.timeSpentIdle = timer.maxIdleTime - 1;
    spyOn(timer, 'onTimeExceeded');
    timer.incrementTimer();
    expect(timer.onTimeExceeded).toHaveBeenCalled();
  });  

  it('should have a noteActivity method', function() {
    expect(timer.noteActivity).toBeAFunction();
  });

  it('.noteActivity() should always set timeSpentIdle to 0', function() {
    timer.timeSpentIdle = 1;
    timer.noteActivity();
    expect(timer.timeSpentIdle).toBe(0);
  });  

  it('when timer.state is "watching_for_new_activity", .noteActivity() should set state to "tracking_idleness"', function() {
    timer.state = "watching_for_new_activity";
    timer.noteActivity();
    expect(timer.state).toBe("tracking_idleness");
  });

  it('when timer.state is "watching_for_new_activity", .noteActivity() should set state to "tracking_idleness"', function() {
    timer.state = "watching_for_new_activity";
    timer.noteActivity();
    expect(timer.state).toBe("tracking_idleness");
  });    

  it('when timer.state is "watching_for_new_activity", .noteActivity() should call timer.onNewActivity', function() {
    spyOn(timer, "onNewActivity");
    timer.state = "watching_for_new_activity";
    timer.noteActivity();
    expect(timer.onNewActivity).toHaveBeenCalled();
  });

  it('should have a start method', function() {
    expect(timer.start).toBeAFunction();
  });

  it("After calling timer.start(), every mousemove or keypress should result in noted activity", function() {
      spyOn(timer, 'noteActivity');
      timer.start();    
      $('body').trigger('mousemove');
      expect(timer.noteActivity.mostRecentCall.args[0].type).toBe('mousemove');
      $('body').trigger('keypress');
      expect(timer.noteActivity.mostRecentCall.args[0].type).toBe('keypress');
  });

});

describe('idleTimer instance w/ options', function() {

  it('should use options passed in on instantiation', function(){
    var timer = new idleTimer({});

    var options = {
      interval: function() { 
        var definition = { 
          meaning: "Amount of time, as Number-of-milliseconds, between checks for idleness",
          default: "1 minute."
        }
      },
      maxIdleTime: function() { 
        var definition = {
          meaning: "Amount of time, as Number-of-milliseconds, a user can be idle before they are considered idle.",
          default: "20 minutes."
        }
      },
      onTimeExceeded: function() {
        var definition = {
          meaning: "callback triggered when a user exceeds maxIdleTime and is now considered idle.",
          default: "logs amount of time idle to the console."
        };
        return "onTimeExceeded";
      },
      onNewActivity: function () {
        var definition = {
          meaning: "callback triggered when there is new activity after a user returns from being idle",
          default: "logs amount of time idle to the console."
        };
        return "onNewActivity";
      }
    };
    var timer = new idleTimer(options);
    expect(timer.interval)          .toBe(options.interval);
    expect(timer.maxIdleTime)       .toBe(options.maxIdleTime);
    expect(timer.onTimeExceeded())  .toBe(options.onTimeExceeded());
    expect(timer.onNewActivity() )  .toBe(options.onNewActivity());
  });

});