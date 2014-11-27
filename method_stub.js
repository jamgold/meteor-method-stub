
if (Meteor.isClient) {
  Session.setDefault('greeting', 'Default Greeting');
  Session.setDefault('progress', 0);
  Session.setDefault('consoleLogOnScreen', true);
  Session.setDefault('modal_body', '<p>The Meteor Method on the server has finished.</p>');
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

  Template.hello.greeting = function () {
    // this = Windows
    var v = Session.get("greeting");
    return v;
  };

  Template.hello.consoleLogOnScreen = function() {
    return Session.get('consoleLogOnScreen') ? 'checked' : '';
  };

  Template.hello.progress = function() {
    return Session.get('progress');
  };

  Template.hello.rendered = function() {
    // this = Template
    //
    // set progress to 0
    //
    Session.set('progress', 0);
    //
    // check if we retained the custom value we set in the create phase
    //
    console.log("Template.hello.rendered template_custom_result_field="+this.template_custom_result_field);
  };

  Template.modal.rendered = function() {
    console.log('Template.modal.rendered');
    TemplateModalInstance = this;
    //
    // add modal event handler to reset result when the modal closes
    //
    this.$('#myModal').on('hidden.bs.modal', function (e) {
        Session.set('progress', 0);
        $('.btn.call-method').removeClass('disabled');
    });
  };

  Template.modal.modal_body = function() {
    console.log('Template.modal.modal_body');
    return Session.get('modal_body');
  };
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
        Session.set('modal_body', 'Last result from server: '+result);
        TemplateModalInstance.$('#myModal').modal();
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

  Meteor.startup(function(){
    Session.setDefault("greeting", "Hello Default");
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
