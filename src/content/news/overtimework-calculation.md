---
slug: "overtimework-calculation"
title: "残業時間・総勤務時間"
date: "2019-05-21T00:15:43"
excerptHtml: "<p>1. 残業時間と総勤務時間の対象 残業時間の対象 残業時間の計算が必要となるのは主に正社員です。 正社員は基本給があり、残業時間に応じて追加の給与を計算するためです。 総勤務時間の対象 総勤務時間の計算が必要となるのは主 [&#8230;]</p>\n<p><a class=\"btn btn-secondary understrap-read-more-link\" href=\"/news/overtimework-calculation/\">続きを読む&#8230;<span class=\"screen-reader-text\"> from 残業時間・総勤務時間</span></a></p>"
description: "1. 残業時間と総勤務時間の対象 残業時間の対象 残業時間の計算が必要となるのは主に正社員です。 正社員は基本給があり、残業時間に応じて追加の給与を計算するためです。 総勤務時間の対象 総勤務時間の計算が必要となるのは主 […] 続きを読む… from 残業時間・総勤務時間"
seoTitle: "残業時間・総勤務時間 - 【公式】ペンギンタイムカード"
seoDescription: "このタイムカードアプリにおいて、残業時間および勤務時間をどのようなロジックで計算しているかを説明します。また、正社員、パート、契約社員に分けて一般的な計算方法を説明します。"
---
<h2>1. 残業時間と総勤務時間の対象</h2>
<h3>残業時間の対象</h3>
<p>残業時間の計算が必要となるのは主に正社員です。<br />
正社員は基本給があり、残業時間に応じて追加の給与を計算するためです。</p>
<h3>総勤務時間の対象</h3>
<p>総勤務時間の計算が必要となるのは主にパート従業員です。パート従業員は総勤務時間に時給をかけて給与を計算するのが基本ですので、大切なのは「総勤務時間」だからです。</p>
<h2>2. 計算方法</h2>
<h4>1. 正社員</h4>
<p>まず、標準勤務時間が下図のイメージだとします。</p>
<p>&nbsp;</p>
<p><a href="/assets/news/2019/05/standard-time.png"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1145" src="/assets/news/2019/05/standard-time-1024x143.png" alt="標準勤務時間" width="640" height="89" srcset="/assets/news/2019/05/standard-time-1024x143.png 1024w, /assets/news/2019/05/standard-time-300x42.png 300w, /assets/news/2019/05/standard-time-768x107.png 768w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>&nbsp;</p>
<p>実際には8:48から17:52まで働いたとすると、残業時間は下図の黄色い部分になります。</p>
<p>&nbsp;</p>
<p><a href="/assets/news/2019/05/contract-employee.png"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1146" src="/assets/news/2019/05/contract-employee-1024x164.png" alt="正社員の残業時間計算" width="640" height="103" srcset="/assets/news/2019/05/contract-employee-1024x164.png 1024w, /assets/news/2019/05/contract-employee-300x48.png 300w, /assets/news/2019/05/contract-employee-768x123.png 768w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>&nbsp;</p>
<p>式）</p>
<p>定時後の残業 = 退勤時刻(17:52)  &#8211;  標準退勤時刻(17:30)  = <strong>0:22</strong></p>
<p>定時前の残業 = 標準出勤時刻(9:00)  &#8211;  出勤時刻(8:48)  = <strong>0:12</strong></p>
<p>残業時間  =  0:22  +  0:12  =  <strong>0:34</strong></p>
<p>&nbsp;</p>
<p>この計算のためには、「従業員タイプ」にて下記のように勤務時間と休憩時間を設定します。<br />
<a href="/assets/news/2019/05/a7d9d2ca3cfc564173d2052e062c8e35.jpg"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1275" src="/assets/news/2019/05/a7d9d2ca3cfc564173d2052e062c8e35-1024x768.jpg" alt="標準勤務時間の設定_正社員" width="640" height="480" srcset="/assets/news/2019/05/a7d9d2ca3cfc564173d2052e062c8e35-1024x768.jpg 1024w, /assets/news/2019/05/a7d9d2ca3cfc564173d2052e062c8e35-300x225.jpg 300w, /assets/news/2019/05/a7d9d2ca3cfc564173d2052e062c8e35-768x576.jpg 768w, /assets/news/2019/05/a7d9d2ca3cfc564173d2052e062c8e35.jpg 2048w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>また、休憩ボタンは非表示にします。<br />
<a href="/assets/news/2019/05/c32c8e0d49a59ea4e0451d874cba8070.jpg"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1276" src="/assets/news/2019/05/c32c8e0d49a59ea4e0451d874cba8070-1024x768.jpg" alt="休憩ボタン_正社員" width="640" height="480" srcset="/assets/news/2019/05/c32c8e0d49a59ea4e0451d874cba8070-1024x768.jpg 1024w, /assets/news/2019/05/c32c8e0d49a59ea4e0451d874cba8070-300x225.jpg 300w, /assets/news/2019/05/c32c8e0d49a59ea4e0451d874cba8070-768x576.jpg 768w, /assets/news/2019/05/c32c8e0d49a59ea4e0451d874cba8070.jpg 2048w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>なお、定時前の残業は認めない、あるいは、認めるが上限がある、という場合はそのような設定が可能です。<br />
詳しくは<a href="/news/overtime-work-in-morning/">早出残業許容時間の説明ページ</a>にて説明します。</p>
<p>&nbsp;</p>
<h4>2. パート社員</h4>
<p>パート社員は一般的に「標準勤務時間」は関係なく、働いた時間を基準に給与を計算します。</p>
<p>したがって、総勤務時間は下記のピンク部分になります。</p>
<p><a href="/assets/news/2019/05/parttime.png"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1148" src="/assets/news/2019/05/parttime-1024x146.png" alt="パート社員の勤務時間計算" width="640" height="91" srcset="/assets/news/2019/05/parttime-1024x146.png 1024w, /assets/news/2019/05/parttime-300x43.png 300w, /assets/news/2019/05/parttime-768x109.png 768w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>式）</p>
<p>（退勤時刻(17:52)  &#8211;  出勤時刻(8:48)）- （休憩終了時刻(12:56) &#8211; 休憩開始時刻(11:52)）=  <strong>8:00</strong></p>
<p>&nbsp;</p>
<p>この計算のためには、「従業員タイプ」の設定にて、標準勤務時間と休憩時間の設定をすべてブランクにします。<br />
こうすることにより、時間はすべてボタンをタップされた時刻を元に計算されます。</p>
<p><a href="/assets/news/2019/05/2effc0e97f9b28d50dc1000cd5f02be9.jpg"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1277" src="/assets/news/2019/05/2effc0e97f9b28d50dc1000cd5f02be9-1024x768.jpg" alt="標準勤務時間の設定_パート" width="640" height="480" srcset="/assets/news/2019/05/2effc0e97f9b28d50dc1000cd5f02be9-1024x768.jpg 1024w, /assets/news/2019/05/2effc0e97f9b28d50dc1000cd5f02be9-300x225.jpg 300w, /assets/news/2019/05/2effc0e97f9b28d50dc1000cd5f02be9-768x576.jpg 768w, /assets/news/2019/05/2effc0e97f9b28d50dc1000cd5f02be9.jpg 2048w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>また、休憩始まり、休憩終わりの時刻も計上する必要があるため、休憩ボタンを表示するよう設定します。<br />
<a href="/assets/news/2019/05/8e50c0a4ce1ea4bf81cff659fb8e58cd.jpg"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1278" src="/assets/news/2019/05/8e50c0a4ce1ea4bf81cff659fb8e58cd-1024x768.jpg" alt="休憩ボタン_パート" width="640" height="480" srcset="/assets/news/2019/05/8e50c0a4ce1ea4bf81cff659fb8e58cd-1024x768.jpg 1024w, /assets/news/2019/05/8e50c0a4ce1ea4bf81cff659fb8e58cd-300x225.jpg 300w, /assets/news/2019/05/8e50c0a4ce1ea4bf81cff659fb8e58cd-768x576.jpg 768w, /assets/news/2019/05/8e50c0a4ce1ea4bf81cff659fb8e58cd.jpg 2048w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>&nbsp;</p>
<h4>3. 派遣社員等</h4>
<p>企業によっては、パート社員だが「休憩時間は１時間固定とみなす」というケースもあると思います。<br />
総勤務時間は下図のピンク部分になります。（休憩時間は12:00-13:00と自動セットされます）</p>
<p><a href="/assets/news/2019/05/temporary-employee.png"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1149" src="/assets/news/2019/05/temporary-employee-1024x167.png" alt="契約社員などの勤務時間計算" width="640" height="104" srcset="/assets/news/2019/05/temporary-employee-1024x167.png 1024w, /assets/news/2019/05/temporary-employee-300x49.png 300w, /assets/news/2019/05/temporary-employee-768x126.png 768w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>&nbsp;</p>
<p>このような場合、標準勤務時間のうち「休憩開始時刻」「休憩終了時刻」のみを設定します。</p>
<p>そうすると、社員が休憩開始・終了ボタンをタップしなくても、アプリは自動的にその休憩時間を考慮して、勤務時間を計算します。一方、出勤、退勤時間は、ボタンがタップされた時刻を元に計算されます。<br />
<a href="/assets/news/2019/05/61ddb589d075003dd64afbb0808cac45.jpg"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1279" src="/assets/news/2019/05/61ddb589d075003dd64afbb0808cac45-1024x768.jpg" alt="標準勤務時間の設定_派遣社員" width="640" height="480" srcset="/assets/news/2019/05/61ddb589d075003dd64afbb0808cac45-1024x768.jpg 1024w, /assets/news/2019/05/61ddb589d075003dd64afbb0808cac45-300x225.jpg 300w, /assets/news/2019/05/61ddb589d075003dd64afbb0808cac45-768x576.jpg 768w, /assets/news/2019/05/61ddb589d075003dd64afbb0808cac45.jpg 2048w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>休憩はボタンは表示しないようにします。<br />
<a href="/assets/news/2019/05/82a787c17820dba8a90c2411d054b264.jpg"><img loading="lazy" decoding="async" class="alignnone size-large wp-image-1280" src="/assets/news/2019/05/82a787c17820dba8a90c2411d054b264-1024x768.jpg" alt="" width="640" height="480" srcset="/assets/news/2019/05/82a787c17820dba8a90c2411d054b264-1024x768.jpg 1024w, /assets/news/2019/05/82a787c17820dba8a90c2411d054b264-300x225.jpg 300w, /assets/news/2019/05/82a787c17820dba8a90c2411d054b264-768x576.jpg 768w, /assets/news/2019/05/82a787c17820dba8a90c2411d054b264.jpg 2048w" sizes="auto, (max-width: 640px) 100vw, 640px" /></a></p>
<p>&nbsp;</p>
<p>&nbsp;</p>
