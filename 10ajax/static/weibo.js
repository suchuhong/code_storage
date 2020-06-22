var timeString = function(timestamp) {
    t = new Date(timestamp * 1000)
    t = t.toLocaleTimeString()
    return t
}

var commentsTemplate = function(comments) {
    var html = ''
    for(var i = 0; i < comments.length; i++) {
        var c = comments[i]
        var t = `
            <div>
                ${c.content}
            </div>
        `
        html += t
    }
    return html
}

var WeiboTemplate = function(Weibo) {
    var content = Weibo.content
    var id = Weibo.id
    var comments = commentsTemplate(Weibo.comments)
    var t = `
        <div class='weibo-cell' id='weibo-${id}'>
            <div class="Weibo-content" data-id=${id}>
                [WEIBO]: <input id="id-content" value=${content}>
                <br>
                <button class="Weibo-delete">删除微博</button>
                <br>
                <button class="Weibo-edit">更新微博</button>
            </div>
            <div class="comment-list">
                ${comments}
            </div>
            <div class="comment-form-${id}" data-id=${id}>
                <input type="hidden" name="weibo_id" value="">
                <input id="id-input-comment-${id}" name="content">
                <br>
                <button class="comment-add">添加评论</button>
            </div>
        </div>
    `
    return t
    /*
    上面的写法在 python 中是这样的
    t = """
    <div class="Weibo-cell">
        <button class="Weibo-delete">删除</button>
        <span>{}</span>
    </div>
    """.format(Weibo)
    */
}

var insertWeibo = function(Weibo) {
    var WeiboCell = WeiboTemplate(Weibo)
    // 插入 Weibo-list
    var WeiboList = e('.weibo-list')
    WeiboList.insertAdjacentHTML('beforeend', WeiboCell)
}

var insertEditForm = function(Weibo, cell) {
    var id = Weibo.id
    var content = Weibo.content
    var form = `
        <div class='Weibo-edit-form' data-id=${id}>
            <input class="Weibo-edit-input" value=${content}>
            <button class='Weibo-update'>更新</button>
        </div>
    `
    cell.insertAdjacentHTML('afterend', form)
    var WeiboCopy = Weibo
    WeiboCopy.content = ''
    var input = cell.querySelector('#id-content')
    input.value = ''
}

var loadWeibos = function() {
    // 调用 ajax api 来载入数据
    apiWeiboAll(function(r) {
        // console.log('load all', r)
        // 解析为 数组
        var Weibos = JSON.parse(r)
        // 循环添加到页面中
        for(var i = 0; i < Weibos.length; i++) {
            var Weibo = Weibos[i]
            insertWeibo(Weibo)
        }
    })
}

var loadWeibosByid = function(id, cell) {
    // 调用 ajax api 来载入数据
    apiWeibobyid(id, function(r) {
        // 解析为 数组
        var Weibo = JSON.parse(r)
        insertEditForm(Weibo, cell)
        log('loadWeibosByid Weibo: ', Weibo)
    })
}

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add-weibo')
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo')
        var title = input.value
        log('click add', title)
        var form = {
            'content': title,
        }
        log('form: ', form)
        apiWeiboAdd(form, function(r) {
            // 收到返回的数据, 插入到页面中
            var Weibo = JSON.parse(r)
            log('bindEventWeiboAdd Weibo.content: ', Weibo.content)
            insertWeibo(Weibo)
        })
    })
}

var bindEventWeiboDelete = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('Weibo-delete')){
            // 删除这个 Weibo
            var Weibocontent = self.parentElement
            log('bindEventWeiboDelete WeiboCell', Weibocontent)
            // data-id 就是 .dataset.id
            var Weibo_id = Weibocontent.dataset.id
            log('Weibo_id', Weibo_id)
            apiWeiboDelete(Weibo_id, function(r){
                log('删除成功', Weibo_id)
                var weibocell = Weibocontent.parentElement
                // 评论也删除了
                weibocell.remove()
            })
        }
    })
}

var bindEventWeiboEdit = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('Weibo-edit')){
            var Weibocontent = self.parentElement
            var id = Weibocontent.dataset.id
            loadWeibosByid(id, Weibocontent)
        }
    })
}

var bindEventWeiboUpdate = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('Weibo-update')){
            log('点击了 update ')
            var editForm = self.parentElement
            log("bindEventWeiboUpdate editForm: ", editForm)
            // querySelector 是 DOM 元素的方法
            // document.querySelector 中的 document 是所有元素的祖先元素
            var input = editForm.querySelector('.Weibo-edit-input')
            var content = input.value
            // 用 closest 方法可以找到最近的直系父节点
            // var WeiboCell = self.closest('.Weibo-cell')
            var Weibo_id = editForm.dataset.id
            var form = {
                'id': Weibo_id,
                'content': content,
            }
            log("bindEventWeiboUpdate form: ", form)
            apiWeiboUpdate(form, function(r){
                log('更新成功', Weibo_id)
                var Weibo = JSON.parse(r)
                var selector = '#weibo-' + Weibo.id
                var WeiboCell = e(selector)
                log('WeiboCell: ', WeiboCell)
                var WeiboContent = WeiboCell.querySelector('.Weibo-content')
                var input = WeiboContent.querySelector('#id-content')
                var WeiboEditForm = WeiboCell.querySelector('.Weibo-edit-form')
                var update = WeiboEditForm.querySelector('.Weibo-edit-input')
                input.value = update.value
            })
        }
    })
}

var bindEventCommentAdd = function() {
    var WeiboList = e('.weibo-list')
    // 注意, 第二个参数可以直接给出定义函数
    WeiboList.addEventListener('click', function(event){
        var self = event.target
        if(self.classList.contains('comment-add')){
            var CommentForm = self.parentElement
            log('bindEventCommentAdd CommentForm', CommentForm)
            var Weibo_id = CommentForm.dataset.id
            log('Weibo_id', Weibo_id)
            var selector_id = '#id-input-comment-' + Weibo_id
            var input = e(selector_id)
            var content = input.value
            var comment = {
                "weibo_id": Weibo_id,
                "content": content,
            }
            // log('bindEventCommentAdd comment ', comment)
            apiCommentAdd(comment, function(r){
                log('添加评论成功', Weibo_id)
                var comment = JSON.parse(r)
                log('comment :', comment)
                // js 数字可以和直接字符串相加
                var selector = '#weibo-' + comment.weibo_id
                var weiboCell = e(selector)
                log('weiboCell: ', weiboCell)
                selector = '.comment-form-' + comment.weibo_id
                var commentForm = weiboCell.querySelector(selector)
                selector = '#id-input-comment-' + comment.weibo_id
                var input = commentForm.querySelector(selector)
                log('apiCommentAdd input.value :', input.value)
                var html =`
                            <div>
                                ${input.value}
                            </div>
                          `
                log('html: ', html)
                selector = '.comment-list'
                var commentList = weiboCell.querySelector(selector)
                commentList.insertAdjacentHTML('afterBegin', html)
            })
        }
    })
}

var bindEvents = function() {
   bindEventWeiboAdd()
   bindEventWeiboDelete()
   bindEventWeiboEdit()
   bindEventWeiboUpdate()
   bindEventCommentAdd()
}

var __main = function() {
    bindEvents()
    loadWeibos()
}

__main()
