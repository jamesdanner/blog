var app = new Vue({
    el: '#app',
    data: {
        tips_show: false,
        form_show: false,
        username: '',
        password: '',
        repassword: '',
        message: '',
        url: '',
    },
    methods: {
        goOut: function(){
            $.ajax({
                url: '/api/user/logout',
                success: function(res){
                    if(!res.code){
                        window.location.reload()
                    }
                }
            })
        },
        submit: function(){
            var me = this
            this.url = this.form_show ? '/api/user/register' : '/api/user/login'
            
            $.ajax({
                type: 'post',
                url: me.url,
                dataType: 'json',
                data: {
                    username: me.username,
                    password: me.password,
                    repassword: me.repassword
                },
                success: function(res){
                    me.message = res.msg
                    me.tips_show = true
                    if(!res.code){
                        setTimeout(function(){
                            me.form_show = false
                            window.location.reload()
                        }, 1000)
                        return
                    }
                    
                    setTimeout(function(){
                        me.message = ''
                        me.tips_show = false
                    }, 1000)
                }
            })
        }
    }
})


