import requests
from bs4 import BeautifulSoup
from feedgen.feed import FeedGenerator
from datetime import datetime
import pytz

def get_buddhistdoor_news():
    url = "https://www.buddhistdoor.net/news/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    fg = FeedGenerator()
    fg.id('https://www.buddhistdoor.net/news/')
    fg.title('Buddhistdoor Global - News')
    fg.link(href='https://www.buddhistdoor.net/news/', rel='alternate')
    fg.description('Latest news from Buddhistdoor Global')
    fg.language('en')
    
    # Favicon của bạn
    icon_url = "https://buddhanussati.github.io/dhamma-quotes/favicon2.png"
    fg.icon(icon_url)
    fg.logo(icon_url)

    articles_data = []

    # Nhắm thẳng vào class elementor-post mà bạn đã gửi
    posts = soup.find_all('article', class_='elementor-post')

    for post in posts:
        # 1. Lấy Tiêu đề và Link
        title_tag = post.find('h3', class_='elementor-post__title')
        if not title_tag: continue
        a_tag = title_tag.find('a')
        if not a_tag: continue
        
        title = a_tag.get_text(strip=True)
        link_url = a_tag['href']

        # 2. Lấy Ảnh (Thumbnail) - Dựa trên HTML bạn gửi
        img_url = ""
        img_container = post.find('div', class_='elementor-post__thumbnail')
        if img_container:
            img_tag = img_container.find('img')
            if img_tag:
                # Ưu tiên src, nếu không có thì lấy data-src
                img_url = img_tag.get('src') or img_tag.get('data-src', '')

        # 3. Lấy Mô tả (Excerpt)
        desc_tag = post.find('div', class_='elementor-post__excerpt')
        description = desc_tag.get_text(strip=True) if desc_tag else ""

        # 4. Lấy Ngày (Nếu có class date của Elementor)
        # Nếu không thấy, ta dùng thời gian hiện tại nhưng sẽ trừ dần để giữ thứ tự
        date_tag = post.find('span', class_='elementor-post-date')
        if date_tag:
            from dateutil import parser
            try:
                pub_date = parser.parse(date_tag.get_text(strip=True)).replace(tzinfo=pytz.utc)
            except:
                pub_date = datetime.now(pytz.utc)
        else:
            pub_date = datetime.now(pytz.utc)

        articles_data.append({
            'title': title,
            'link': link_url,
            'desc': description,
            'img': img_url,
            'date': pub_date
        })

   
        articles_data.reverse()

    for data in articles_data:
        fe = fg.add_entry()
        fe.id(data['link'])
        fe.title(data['title'])
        fe.link(href=data['link'])
        fe.pubDate(data['date'])
        
        # Hiển thị ảnh to và đẹp trong Description
        content = ""
        if data['img']:
            content += f'<p><img src="{data["img"]}" style="width:100%; border-radius:8px;"></p>'
            fe.enclosure(data['img'], 0, 'image/jpeg')
            
        content += f'<p>{data["desc"]}</p>'
        fe.description(content)

    fg.rss_file('rss.xml', pretty=True)
    print(f"Xong! Đã lấy được {len(articles_data)} bài viết kèm hình ảnh.")

if __name__ == "__main__":
    get_buddhistdoor_news()