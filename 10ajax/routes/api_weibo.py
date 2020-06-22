import json
from routes.session import session
from utils import (
    log,
    redirect,
    http_response,
    json_response,
)
from models.weibo import Weibo
from models.weibo import Comment


def all_weibo(request):
    """
    返回所有 todo
    """
    ms = Weibo.all()
    # 要转换为 dict 格式才行
    data = [m.json() for m in ms]
    return json_response(data)


def add_weibo(request):
    """
    接受浏览器发过来的添加 weibo 请求
    添加数据并返回给浏览器
    """
    # 将获得的请求转换为 json 格式的字符串
    form = request.json()
    log('add_weibo form: ', form)
    # 创建一个 model
    m = Weibo.new(form)
    log('m: ', m)
    # 把创建好的 model 返回给浏览器
    log('add_weibo json_response(m.json()): ', json_response(m.json()))
    return json_response(m.json())


def delete_weibo(request):
    """
    通过下面这样的链接来删除一个 weibo
    /delete?id=1
    """
    weibo_id = int(request.query.get('id'))
    model = Weibo.delete(weibo_id)
    return json_response(model.json())


def replsce_weibo(request):
    """
    通过下面这样的链接来删除一个 weibo
    /edit?id=1
    """
    weibo_id = int(request.query.get('id'))
    model = Weibo.find_by(id=weibo_id)
    return json_response(model.json())


def update_weibo(request):
    form = request.json()
    weibo_id = int(form.get('id'))
    model = Weibo.update(weibo_id, form)
    return json_response(model.json())


def add_comment(request):
    """
    接受浏览器发过来的添加 comment 请求
    添加数据并返回给浏览器
    """
    # 将获得的请求转换为 json 格式的字符串
    form = request.json()
    log('add_comnent form: ', form)
    # 创建一个 model
    m = Comment.new(form)
    log('m: ', m)
    # 把创建好的 model 返回给浏览器
    log('add_weibo json_response(m.json()): ', json_response(m.json()))
    return json_response(m.json())


route_dict = {
    '/api/weibo/all': all_weibo,
    '/api/weibo/add': add_weibo,
    '/api/weibo/delete': delete_weibo,
    '/api/weibo/edit': replsce_weibo,
    '/api/weibo/update': update_weibo,
    # 评论
    '/api/comment/add': add_comment,
}
