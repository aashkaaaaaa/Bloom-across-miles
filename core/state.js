/* Shared bouquet state. S is the bouquet being built or viewed.
   The builder fills S.note from its form at start-up (see app.js).
   New features keep their own state instead of adding to this file. */

let S={stems:[],wrapper:'kraft',ribbon:'rose',backdrop:'#FFFDF9',note:{show:true,to:'My Love',from:'Yours Always',dist:'1,420 miles apart',msg:''}};
let selUid=null,dragCtx=null,feedback=null,promptIdx=0;
let bouquetLink='',envelopeOpened=false;
