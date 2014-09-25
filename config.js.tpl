exports.config = function() {
  return {
    db: {
	hostname: '',
        dbName: '',
        port: '5432'
    },
    session: {
        sessionTimeOut: 60 * 60 * 1000// session timeout in ms - cant go beyond under one hour
    }  
  };  
};
