if (Meteor.isClient) {
  Session.setDefault('greeting', 'Default Greeting');
  Session.setDefault('progress', 0);
  Session.setDefault('consoleLogOnScreen', true);
  //
  // create some global variables for debugging
  //
  TemplateHelloInstance = null;
  TemplateModalInstance = null;
  //
  // overwrite console.log to print messages into PRE on screen
  //
  console.logOrig = console.log;

  console.log = function(x) {
    if(Session.get('consoleLogOnScreen'))
    {
      $('#log').append('<div>'+x+'</div>');      
    }
    else
    {
      console.logOrig(x);
    }
  };

  Template.hello.created = function() {
    // this = Template
    TemplateHelloInstance = this;

    console.log("Template.hello.created");
    //
    // create a custom template field to test if it will survive
    //
    this.template_custom_result_field = 'changes will never be visible in template.rendered';
  };

  Template.hello.rendered = function () {
  };

  Template.hello.helpers({
    greeting: function () {
      // this = Windows
      var v = Session.get("greeting");
      return v;
    },
    consoleLogOnScreen: function() {
      return Session.get('consoleLogOnScreen') ? 'checked' : '';
    },
    progress: function() {
      return Session.get('progress');
    },
    rendered: function() {
      // this = Template
      //
      // set progress to 0
      //
      Session.set('progress', 0);
      //
      // check if we retained the custom value we set in the create phase
      //
      console.log("Template.hello.rendered template_custom_result_field="+this.template_custom_result_field);
    }
  });

  //
  // create function to handle the results of the method call
  //
  var methodResult = function(err, result)
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      TemplateHelloInstance.template_custom_result_field = result;

      if(Session.equals('progress', 100))
      {
        console.log("Method result: "+result);
        Bootstrap3boilerplate.Modal.body.set('Last result from server: '+result);
        Bootstrap3boilerplate.Modal.show();
      }
      else
      {
        console.log("Method result: "+result);
        //
        // now call the method again
        //
        Meteor.call('stub_method', new Date().getTime() , methodResult);
      }
    }
  };

  Template.hello.events({
    'click .btn.call-method' : function (e, template) {
      console.log('Old stub method result: template.template_custom_result_field='+template.template_custom_result_field);
      template.call_time = new Date().getTime();
      // disable the button
      template.$('.btn.call-method').addClass('disabled');
      //
      // now call the method
      //
      Meteor.call('stub_method',  template.call_time , methodResult);
    },
    'change input.consoleLogOnScreen': function(e,template) {
      e.preventDefault();
      Session.set('consoleLogOnScreen', e.target.checked);
    }
  });

  Bootstrap3boilerplate.setContent('#hello');

  Bootstrap3boilerplate.ProjectName.set({text:'Meteor Stub Methods'});

  Bootstrap3boilerplate.Navbar.left = function(){
    return [
    // {text:'Home',href:'#hello'}
    ];
  };
  
  Bootstrap3boilerplate.Navbar.right = function(){
    return [];
  };

  Bootstrap3boilerplate.Modal.title.set('Method Done');
  Bootstrap3boilerplate.Modal.body.set('<p>The Meteor Method on the server has finished.</p>');

  //
  // assign additional rendered function to Modal to add event to reset progress
  //
  Bootstrap3boilerplate.Modal.rendered = function(){
    //
    // this is Bootstrap3boilerplate.Modal
    //
    this.template.$('#'+this.id).on('hidden.bs.modal', function (e) {
        Session.set('progress', 0);
        $('.btn.call-method').removeClass('disabled');
    });
  };

  Meteor.startup(function(){
    Session.set('progress',0);
    console.log('startup');
    Bootstrap3boilerplate.init();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
//
// create a method on client & server
//
Meteor.methods({
  stub_method: function(v) {
    // var v = t.call_time;
    //
    // this runs on the client
    //
    if(this.isSimulation)
    {
      console.log("Simulation: Hello Client "+v);
      // the return value will be in the result parameter of the async callback
      Session.set("greeting", "Hello Client Simulated "+v);
      // increase the progress
      Session.set('progress', Session.get('progress')+5);
    }
    else
    {
      //
      // this only runs on the server
      // create small delay before returning
      //
      for(var i=parseInt(v,10);i>0;i--) {
        i-=5000;
      }
      //
      // the return value will be in the result parameter of the async callback
      //
      return "Hello from Server method "+v;
    }
  }
});
