---
slug: "time-rounding"
title: "丸め処理"
date: "2019-05-17T17:37:34"
excerptHtml: "<p>丸め処理の考え方 1. 丸め処理とは 例えば、定時退社が18:00で、18:23に退社した場合、それを18:20の退社とみなしたり、18:15の退社とみなしたりするのが丸め処理です。 この例では、「10分ごとの切り捨て」 [&#8230;]</p>\n<p><a class=\"btn btn-secondary understrap-read-more-link\" href=\"/news/time-rounding/\">続きを読む&#8230;<span class=\"screen-reader-text\"> from 丸め処理</span></a></p>"
description: "丸め処理の考え方 1. 丸め処理とは 例えば、定時退社が18:00で、18:23に退社した場合、それを18:20の退社とみなしたり、18:15の退社とみなしたりするのが丸め処理です。 この例では、「10分ごとの切り捨て」 […] 続きを読む… from 丸め処理"
seoTitle: "丸め処理 - 【公式】ペンギンタイムカード"
seoDescription: "丸め処理の考え方と、ペンギンタイムカードアプリにおける丸めロジックを説明します"
---
<h2>丸め処理の考え方</h2>
<h3>1. 丸め処理とは</h3>
<p>例えば、定時退社が18:00で、18:23に退社した場合、それを18:20の退社とみなしたり、18:15の退社とみなしたりするのが丸め処理です。</p>
<p>この例では、「10分ごとの切り捨て」にすると、丸め処理後の退勤時間は18:20になります。</p>
<p>このように、丸め処理には「何分単位で丸めるか」「切り捨て、切り上げ、四捨五入のうちどれを適用するか」という２つの設定が必要です。</p>
<h3>2. 丸め処理の時間</h3>
<p>丸め処理をする時間単位です。通常、5分単位、10分単位、15分単位で丸めることが多いようです。30分単位で丸める場合もあります。</p>
<h3>3. 丸め処理の種類</h3>
<p>丸め処理の種類には３つあります。<br />
1. 切り捨て<br />
2. 切り上げ<br />
3. 四捨五入</p>
<h3>4. 計算方法</h3>
<p>丸め処理の時間と種類によって、以下のように計算されます。</p>
<p>例）定時退社18:00で、18:23に退社した</p>
<table class="table1 table">
<tbody>
<tr style="height: 24px;">
<td style="width: 81.8833px; height: 24px;">打刻</td>
<td style="width: 82.6667px; height: 24px;">丸め時間</td>
<td style="width: 82.65px; height: 24px;">丸め種類</td>
<td style="width: 83.8px; height: 24px;">丸め結果</td>
</tr>
<tr style="height: 24px;">
<td style="width: 81.8833px; height: 216px;" rowspan="9">18:23</td>
<td style="width: 82.6667px; height: 72px;" rowspan="3">5分</td>
<td style="width: 82.65px; height: 24px;">切り捨て</td>
<td style="width: 83.8px; height: 24px;">18:20</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.65px; height: 24px;">切り上げ</td>
<td style="width: 83.8px; height: 24px;">18:25</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.65px; height: 24px;">四捨五入</td>
<td style="width: 83.8px; height: 24px;">18:25</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.6667px; height: 72px;" rowspan="3">10分</td>
<td style="width: 82.65px; height: 24px;">切り捨て</td>
<td style="width: 83.8px; height: 24px;">18:20</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.65px; height: 24px;">切り上げ</td>
<td style="width: 83.8px; height: 24px;">18:30</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.65px; height: 24px;">四捨五入</td>
<td style="width: 83.8px; height: 24px;">18:20</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.6667px; height: 72px;" rowspan="3">15分</td>
<td style="width: 82.65px; height: 24px;">切り捨て</td>
<td style="width: 83.8px; height: 24px;">18:15</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.65px; height: 24px;">切り上げ</td>
<td style="width: 83.8px; height: 24px;">18:30</td>
</tr>
<tr style="height: 24px;">
<td style="width: 82.65px; height: 24px;">四捨五入</td>
<td style="width: 83.8px; height: 24px;">18:30</td>
</tr>
</tbody>
</table>
<h3>5. 主な設定例</h3>
<p>上記の設定は、<br />
出勤時<br />
退勤時<br />
休憩開始時<br />
休憩終了時<br />
にそれぞれ設定できます。</p>
<p>一般的に、企業としては勤務時間を丸めることで少し短く計算するが多いと思います（それ自体がどうなのかは置いておいて・・・）。</p>
<p>その結果、<br />
出勤時　：切り上げ<br />
退勤時　：切り捨て<br />
と設定する企業が多いと思います。</p>
<p>休憩時間については、企業によって対応が異なるようです。私たちがヒアリングした限りでは、パート社員の場合は休憩時間は丸めないことが多いようです。正社員の場合は、「固定で１時間」としているところが多いようです。</p>
<p>なお、これらの設定は従業員タイプ（正社員、パート社員など）ごとに分けられます。正社員は10分で丸め、パート社員は丸め処理をしない、といった感じで異なる設定が可能です。</p>
