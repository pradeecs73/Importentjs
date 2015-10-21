var peoples_entity ;
define(["app", "pages/vkmui-circular-maps", "pages/vkmui-topic-bubbles", "pages/vkm-sidebar-filters", "services/vkmservices/landingDemoService", "services/vkmservices/topicDemoServices", "pages/vkmui-modals"],function(app, vkmui_circular, vkmui_bubbles, vkm_sidebar, landing_demo, topic_demo, vkm_modals){

  vkmui = app.vkmui;

function toggleLegendCaret(toggle, collapsePane){
  $(toggle).on('click', function(){
    if($(collapsePane).hasClass('in')){
      $(toggle).attr('data-icon-before', 'caret-up');
    } else {
      $(toggle).attr('data-icon-before', 'caret-down');
    }
  });  
}

return{
  /*initLoad: initLoad,*/
  toggleLegendCaret: toggleLegendCaret
}
});