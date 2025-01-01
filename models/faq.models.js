FAQ:[
    {
      indexNo:{
        type:Number,
        unique:true,
      },
      question:{
        type:String,
        required:true,
      },
      answer:{
        type:String,
        required:true,
      },
    },{timestamps: true},
  ]