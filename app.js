/**
 * 获取依赖
 * @type {*}
 */
const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');

// const reptileUrl = "http://www.leleketang.com/cr/categories.php";
/**
 * 处理空格和回车
 * @param text
 * @returns {string}
 */
function replaceText(text) {
  return text.replace(/\n/g, "").replace(/\s/g, "");
}
/**
 * 核心业务
 * 发请求，解析数据，生成数据
 * heads:请求头  GET请求
 * $:cheerio解析页面
 */
function getHeads(course_id) {
  return {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Cookie': 'gs_browser=pc; gs_browse_mode=desktop; gs_anony=O%3A4%3A%22User%22%3A33%3A%7Bs%3A2%3A%22id%22%3Bi%3A310237403%3Bs%3A6%3A%22fromId%22%3Bs%3A5%3A%22anony%22%3Bs%3A5%3A%22snsId%22%3Bi%3A0%3Bs%3A8%3A%22nickname%22%3Bs%3A15%3A%22%E6%B8%B8%E5%AE%A2310237403%22%3Bs%3A6%3A%22gender%22%3Bi%3A0%3Bs%3A6%3A%22avatar%22%3Bs%3A23%3A%22%2Flogin%2Fimage%2Fanony2.png%22%3Bs%3A5%3A%22space%22%3Bs%3A0%3A%22%22%3Bs%3A5%3A%22email%22%3Bs%3A0%3A%22%22%3Bs%3A6%3A%22mobile%22%3Bs%3A0%3A%22%22%3Bs%3A8%3A%22realName%22%3Bs%3A0%3A%22%22%3Bs%3A8%3A%22location%22%3Bs%3A0%3A%22%22%3Bs%3A5%3A%22brief%22%3Bs%3A0%3A%22%22%3Bs%3A9%3A%22signature%22%3Bs%3A0%3A%22%22%3Bs%3A10%3A%22createTime%22%3Bs%3A0%3A%22%22%3Bs%3A4%3A%22fans%22%3Bi%3A0%3Bs%3A7%3A%22follows%22%3Bi%3A0%3Bs%3A8%3A%22articles%22%3Bi%3A0%3Bs%3A4%3A%22role%22%3Bi%3A0%3Bs%3A8%3A%22roleName%22%3Bs%3A0%3A%22%22%3Bs%3A6%3A%22skinId%22%3Bi%3A0%3Bs%3A8%3A%22birthday%22%3Bs%3A0%3A%22%22%3Bs%3A10%3A%22locationId%22%3Bi%3A0%3Bs%3A9%3A%22famillyId%22%3Bi%3A0%3Bs%3A6%3A%22visits%22%3Bi%3A0%3Bs%3A13%3A%22lastVisitTime%22%3BN%3Bs%3A4%3A%22days%22%3Bi%3A0%3Bs%3A8%3A%22lastDays%22%3Bi%3A0%3Bs%3A5%3A%22coins%22%3Bi%3A0%3Bs%3A4%3A%22gems%22%3Bi%3A0%3Bs%3A11%3A%22experiences%22%3Bi%3A0%3Bs%3A19%3A%22current_experiences%22%3Bi%3A0%3Bs%3A5%3A%22level%22%3Bi%3A0%3Bs%3A6%3A%22awards%22%3Bi%3A0%3B%7D; Hm_lvt_8296a32ce52c7db4820be505c8738193=1573108957; grade_id=30; PHPSESSID=6v8ck0djla9jhome0orjp6cml7;  Hm_lpvt_8296a32ce52c7db4820be505c8738193=1573115106;' + course_id
  }
}


// 解析数据
function getCheerio(res) {
  return cheerio.load(res.text, {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true
  });
}


//第二个页面http://www.leleketang.com/cr/爬取
/**
 * 定义请求地址
 * @type {*}
 */
let reptileUrl = "http://www.leleketang.com/cr/";
superagent
  .get(reptileUrl)
  .set(getHeads('course_id=0'))
  .end(function (err, res) {
    // 抛错拦截
    if (err) {
      throw Error(err.text);
    }
    let data = [];
    let $ = getCheerio(res);
    $('.courses').children('div').each(function (i, elem) {
      let _this = $(elem);
      let Projects = {};
      Projects.Name = replaceText(_this.find('.course_img').text());
      Projects.P_id = _this.find('a')['0'].attribs.href.split('=')[1];
      Projects.Version = replaceText(_this.find('span').text());
      Projects.course_id = _this.find('a')['0'].attribs.href.split('?')[1];
      data.push(Projects);
    });
    /**第三个页面http://www.leleketang.com/cr/categories.php爬取
     * 根据不同的课程id(即第二个页面获取的course_id))
     * 设置不同的请求头的Cookie值
     */
    for (const iterator of data) {
      reptileUrl = "http://www.leleketang.com/cr/categories.php";
      superagent
        .get(reptileUrl)
        .set(getHeads(iterator.course_id))
        .end(function (err, res) {
          // 抛错拦截
          if (err) {
            throw Error(err.text);
          }
          console.log(iterator.course_id);
          let data = [];
          let $ = getCheerio(res);
          //天天练
          //获取科目
          $('.knowledge_course').each((i, elem) => {
            console.log(elem.children[0].data)
          });
          //获取视频名称  与iD
          $('.categories').find('a').each((i, elem) => {
            console.log(i, elem.attribs.title, elem.attribs.href)
          });
          // console.log(res.text);
          // 生成数据
          // console.log(data);
        });
    }
    // 生成数据
    console.log(data);
  });