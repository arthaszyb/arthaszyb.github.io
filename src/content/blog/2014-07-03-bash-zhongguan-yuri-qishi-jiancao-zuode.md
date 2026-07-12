---
title: Bash中关于日期时间操作的常用自定义函数
date: '2014-07-03'
description: 在编写Linux Bash脚本时，经常会用到一些日期时间有关的命令，下面是我多年Shell编程中常用的函数，现在整理出来，希望起到抛砖引玉的作用。
category: linux
tags:
  - shell-scripting
draft: false
source: evernote-local-db
lang: zh
---
在编写Linux Bash脚本时，经常会用到一些日期时间有关的命令，下面是我多年Shell编程中常用的函数，现在整理出来，希望起到抛砖引玉的作用。

附件包括三个文件：

datetime.sh 包含了Bash中关于日期时间操作的常用自定义函数

test\_datetime.sh 用来展示datetime.sh中自定义函数的用法

test\_datetime.txt 是test\_datetime.sh的一次执行输出样本

执行命令：

Bash代码

![](/images/legacy/legacy-82ce4531b7.png)

1. ./test\_datetime.sh >test\_datetime.txt

文件：datetime.sh

Bash代码

![](/images/legacy/legacy-82ce4531b7.png)

1. #!/bin/sh

2.

3.

4. # Copyright (c) 2010 codingstandards. All rights reserved.

5. # file: datetime.sh

6. # description: Bash中关于日期时间操作的常用自定义函数

7. # license: LGPL

8. # author: codingstandards

9. # email: [codingstandards@gmail.com](mailto:codingstandards@gmail.com)

10. # version: 1.0

11. # date: 2010.02.27

12.

13.

14. # usage: yesterday

15. # 昨天

16. # 比如今天是2010年2月27日，那么结果就是2010\-02\-26

17. yesterday()

18. {

19. date --date='1 day ago' +%Y-%m-%d

20. }

21.

22. # usage: today

23. # 今天

24. # 比如今天是2010年2月27日，那么结果就是2010\-02\-27

25. today()

26. {

27. date +%Y-%m-%d

28. }

29.

30. # usage: now

31. # 现在，包括日期和时间、纳秒

32. # 比如：2010\-02\-27 11:29:52.991774000

33. now()

34. {

35. date "+%Y-%m-%d %H:%M:%S.%N"

36. }

37.

38. # usage: curtime

39. # 当前时间，包括日期和时间

40. # 比如：2010\-02\-27 11:51:04

41. curtime()

42. {

43. date '+%Y-%m-%d %H:%M:%S'

44. # 也可写成：date '+%F %T'

45. }

46.

47. # usage: last\_month

48. # 取上个月的年月

49. # 比如：2010\-01

50. last\_month()

51. {

52. date --date='1 month ago' '+%Y-%m'

53. }

54.

55. # usage: last\_month\_packed

56. # 取上个月的年月

57. # 比如：201001

58. last\_month\_packed()

59. {

60. date --date='1 month ago' '+%Y%m'

61. }

62.

63. # usage: first\_date\_of\_last\_month

64. # 取上个月的第一天

65. # 比如本月是2010年2月，那么结果就是2010\-01\-01

66. first\_date\_of\_last\_month()

67. {

68. date --date='1 month ago' '+%Y-%m-01'

69. }

70.

71. # usage: last\_date\_of\_last\_month

72. # 取上个月的最后一天

73. # 比如当前是2010年2月，那么结果就是2010\-01\-31

74. last\_date\_of\_last\_month()

75. {

76. date --date="$(date +%e) days ago" '+%Y-%m-%d'

77. }

78.

79. # usage: day\_of\_week

80. # 今天的星期

81. # day of week (0..6); 0 represents Sunday

82. day\_of\_week()

83. {

84. date +%w

85. }

86.

87. # usage: last\_hour

88. # 上个小时

89. # 比如：2010\-02\-27\-10

90. # 适合处理log4j生成的日志文件名

91. last\_hour()

92. {

93. date --date='1 hour ago' +%Y-%m-%d-%H

94. }

95.

96. # usage: the\_hour

97. # 当前的小时，为方便算术比较，结果不以0开头

98. # 比如：12

99. the\_hour()

100. {

101. #date +%H # hour (00..23)

102. date +%k # hour ( 0..23)

103. }

104.

105. # usage: the\_minute

106. # 当前的分钟，为方便算术比较，结果不以0开头

107. # 比如：

108. the\_minute()

109. {

110. MM=$(date +%M) # minute (00..59)

111. echo $\[1$MM-100\]

112. }

113.

114. # usage: the\_second

115. # 当前的秒数

116. # 比如：

117. the\_second()

118. {

119. SS=$(date +%S) # second (00..60); the 60 is necessary to accommodate a leap second

120. echo $\[1$SS-100\]

121. }

122.

123. # usage: the\_year

124. # 当前的年份 year (1970...)

125. # 比如：2010

126. the\_year()

127. {

128. date +%Y

129. }

130.

131. # usage: the\_month

132. # 当前的月份，为方便算术比较，结果不以0开头

133. # 比如：2

134. the\_month()

135. {

136. M=$(date +%m) # month (01..12)

137. echo $\[1$M-100\]

138. }

139.

140. # usage: the\_date

141. # 当前的日期，为方便算术比较，结果不以0开头

142. # 比如：27

143. the\_date()

144. {

145. date +%e # day of month, blank padded ( 1..31)

146. }

147.

148. # usage: days\_ago <n>

149. # 取n天前的日期

150. # 比如：days\_ago 0就是今天，days\_ago 1就是昨天，days\_ago 2就是前天，days\_ago -1就是明天

151. # 格式：2010\-02\-27

152. days\_ago()

153. {

154. date --date="$1 days ago" +%Y-%m-%d

155. }

156.

157. # usage: chinese\_date\_and\_week()

158. # 打印中文的日期和星期

159. # 比如：2月27日 星期六

160. chinese\_date\_and\_week()

161. {

162. WEEKDAYS=(星期日 星期一 星期二 星期三 星期四 星期五 星期六)

163. WEEKDAY=$(date +%w)

164. #DT="$(date +%Y年%m月%d日) ${WEEKDAYS\[$WEEKDAY\]}"

165. MN=1$(date +%m)

166. MN=$\[MN-100\]

167. DN=1$(date +%d)

168. DN=$\[DN-100\]

169. DT="$MN月$DN日 ${WEEKDAYS\[$WEEKDAY\]}"

170. echo "$DT"

171. }

172.

173. # usage: rand\_digit

174. # 随机数字，0\-9

175. rand\_digit()

176. {

177. S="$(date +%N)"

178. echo "${S:5:1}"

179. }

180.

181. # usage: seconds\_of\_date \[<date> \[<time>\]\]

182. # 获取指定日期的秒数（自1970年）

183. # 比如：seconds\_of\_date "2010-02-27" 返回 1267200000

184. seconds\_of\_date()

185. {

186. if \[ "$1" \]; then

187. date -d "$1 $2" +%s

188. else

189. date +%s

190. fi

191. }

192.

193. # usage: date\_of\_seconds <seconds>

194. # 根据秒数（自1970年）得到日期

195. # 比如：date\_of\_seconds 1267200000 返回 2010\-02\-27

196. date\_of\_seconds()

197. {

198. date -d "1970-01-01 UTC $1 seconds" "+%Y-%m-%d"

199. }

200.

201. # usage: datetime\_of\_seconds <seconds>

202. # 根据秒数（自1970年）得到日期时间

203. # 比如：datetime\_of\_seconds 1267257201 返回 2010\-02\-27 15:53:21

204. datetime\_of\_seconds()

205. {

206. date -d "1970-01-01 UTC $1 seconds" "+%Y-%m-%d %H:%M:%S"

207. }

208.

209. # usage: leap\_year <yyyy>

210. # 判断是否闰年

211. # 如果yyyy是闰年，退出码为0；否则非0

212. # 典型示例如下：

213. # if leap\_year 2010; then

214. # echo "2010 is leap year";

215. # fi

216. # if leap\_year 2008; then

217. # echo "2008 is leap year";

218. # fi

219. # 摘自脚本：datetime\_util.sh (2007.06.11)

220. # 注：这个脚本来自网络，略有修改（原脚本从标准输入获取年份，现改成通过参数指定）

221. # Shell program to read any year and find whether leap year or not

222. # -----------------------------------------------

223. # Copyright (c) 2005 nixCraft project <[http://cyberciti.biz/fb/](http://cyberciti.biz/fb/)\>

224. # This script is licensed under GNU GPL version 2.0 or above

225. # -------------------------------------------------------------------------

226. # This script is part of nixCraft shell script collection (NSSC)

227. # Visit [http://bash.cyberciti.biz/](http://bash.cyberciti.biz/) for more information.

228. # -------------------------------------------------------------------------

229. leap\_year()

230. {

231. # store year

232. yy=$1

233. isleap="false"

234.

235. #echo -n "Enter year (yyyy) : "

236. #read yy

237.

238. # find out if it is a leap year or not

239.

240. if \[ $((yy % 4)) -ne 0 \] ; then

241. : # not a leap year : means do nothing and use old value of isleap

242. elif \[ $((yy % 400)) -eq 0 \] ; then

243. # yes, it's a leap year

244. isleap="true"

245. elif \[ $((yy % 100)) -eq 0 \] ; then

246. : # not a leap year do nothing and use old value of isleap

247. else

248. # it is a leap year

249. isleap="true"

250. fi

251. #echo $isleap

252. if \[ "$isleap" == "true" \]; then

253. # echo "$yy is leap year"

254. return 0

255. else

256. # echo "$yy is NOT leap year"

257. return 1

258. fi

259. }

260.

261. # usage: validity\_of\_date <yyyy> <mm> <dd>

262. # 判断yyyy-mm-dd是否合法的日期

263. # 如果是，退出码为0；否则非0

264. # 典型示例如下：

265. # if validity\_of\_date 2007 02 03; then

266. # echo "2007 02 03 is valid date"

267. # fi

268. # if validity\_of\_date 2007 02 28; then

269. # echo "2007 02 28 is valid date"

270. # fi

271. # if validity\_of\_date 2007 02 29; then

272. # echo "2007 02 29 is valid date"

273. # fi

274. # if validity\_of\_date 2007 03 00; then

275. # echo "2007 03 00 is valid date"

276. # fi

277. # 摘自脚本：datetime\_util.sh (2007.06.11)

278. # 注：这个脚本来自网络，略有修改（原脚本从标准输入获取年月日，现改成通过参数指定）

279. # Shell program to find the validity of a given date

280. # -----------------------------------------------

281. # Copyright (c) 2005 nixCraft project <[http://cyberciti.biz/fb/](http://cyberciti.biz/fb/)\>

282. # This script is licensed under GNU GPL version 2.0 or above

283. # -------------------------------------------------------------------------

284. # This script is part of nixCraft shell script collection (NSSC)

285. # Visit [http://bash.cyberciti.biz/](http://bash.cyberciti.biz/) for more information.

286. # -------------------------------------------------------------------------

287. validity\_of\_date()

288. {

289. # store day, month and year

290. yy=$1

291. mm=$2

292. dd=$3

293.

294. # store number of days in a month

295. days=0

296.

297. # get day, month and year

298. #echo -n "Enter day (dd) : "

299. #read dd

300.

301. #echo -n "Enter month (mm) : "

302. #read mm

303.

304. #echo -n "Enter year (yyyy) : "

305. #read yy

306.

307. # if month is negative (<0) or greater than 12

308. # then it is invalid month

309. if \[ $mm -le 0 -o $mm -gt 12 \]; then

310. #echo "$mm is invalid month."

311. return 1

312. fi

313.

314. # Find out number of days in given month

315. case $mm in

316. 1) days=31;;

317. 01) days=31;;

318. 2) days=28 ;;

319. 02) days=28 ;;

320. 3) days=31 ;;

321. 03) days=31 ;;

322. 4) days=30 ;;

323. 04) days=30 ;;

324. 5) days=31 ;;

325. 05) days=31 ;;

326. 6) days=30 ;;

327. 06) days=30 ;;

328. 7) days=31 ;;

329. 07) days=31 ;;

330. 8) days=31 ;;

331. 08) days=31 ;;

332. 9) days=30 ;;

333. 09) days=30 ;;

334. 10) days=31 ;;

335. 11) days=30 ;;

336. 12) days=31 ;;

337. \*) days=-1;;

338. esac

339.

340. # find out if it is a leap year or not

341.

342. if \[ $mm -eq 2 \]; then # if it is feb month then only check of leap year

343. if \[ $((yy % 4)) -ne 0 \] ; then

344. : # not a leap year : means do nothing and use old value of days

345. elif \[ $((yy % 400)) -eq 0 \] ; then

346. # yes, it's a leap year

347. days=29

348. elif \[ $((yy % 100)) -eq 0 \] ; then

349. : # not a leap year do nothing and use old value of days

350. else

351. # it is a leap year

352. days=29

353. fi

354. fi

355.

356. #echo $days

357.

358. # if day is negative (<0) and if day is more than

359. # that months days then day is invaild

360. if \[ $dd -le 0 -o $dd -gt $days \]; then

361. #echo "$dd day is invalid"

362. return 3

363. fi

364.

365. # if no error that means date dd/mm/yyyy is valid one

366. #echo "$dd/$mm/$yy is a vaild date"

367. #echo "$yy-$mm-$dd is a valid date"

368. #echo "valid"

369. return 0

370. }

371.

372. # usage: days\_of\_month <mm> <yyyy>

373. # 获取yyyy年mm月的天数，注意参数顺序

374. # 比如：days\_of\_month 2 2007 结果是28

375. days\_of\_month()

376. {

377. # store day, month and year

378. mm=$1

379. yy=$2

380.

381. # store number of days in a month

382. days=0

383.

384. # get day, month and year

385. #echo -n "Enter day (dd) : "

386. #read dd

387.

388. #echo -n "Enter month (mm) : "

389. #read mm

390.

391. #echo -n "Enter year (yyyy) : "

392. #read yy

393.

394. # if month is negative (<0) or greater than 12

395. # then it is invalid month

396. if \[ $mm -le 0 -o $mm -gt 12 \]; then

397. #echo "$mm is invalid month."

398. echo -1

399. return 1

400. fi

401.

402. # Find out number of days in given month

403. case $mm in

404. 1) days=31;;

405. 01) days=31;;

406. 2) days=28 ;;

407. 02) days=28 ;;

408. 3) days=31 ;;

409. 03) days=31 ;;

410. 4) days=30 ;;

411. 04) days=30 ;;

412. 5) days=31 ;;

413. 05) days=31 ;;

414. 6) days=30 ;;

415. 06) days=30 ;;

416. 7) days=31 ;;

417. 07) days=31 ;;

418. 8) days=31 ;;

419. 08) days=31 ;;

420. 9) days=30 ;;

421. 09) days=30 ;;

422. 10) days=31 ;;

423. 11) days=30 ;;

424. 12) days=31 ;;

425. \*) days=-1;;

426. esac

427.

428. # find out if it is a leap year or not

429.

430. if \[ $mm -eq 2 \]; then # if it is feb month then only check of leap year

431. if \[ $((yy % 4)) -ne 0 \] ; then

432. : # not a leap year : means do nothing and use old value of days

433. elif \[ $((yy % 400)) -eq 0 \] ; then

434. # yes, it's a leap year

435. days=29

436. elif \[ $((yy % 100)) -eq 0 \] ; then

437. : # not a leap year do nothing and use old value of days

438. else

439. # it is a leap year

440. days=29

441. fi

442. fi

443.

444. echo $days

445. }

文件：test\_datetime.sh

Bash代码

![](/images/legacy/legacy-82ce4531b7.png)

1. #!/bin/sh

2.

3. # TODO: 注意根据datetime.sh的实际位置更改

4. . /opt/shtools/commons/datetime.sh

5.

6. echo "当前时间（date）：$(date)"

7. echo "昨天（yesterday）：$(yesterday)"

8. echo "今天（today）：$(today)"

9. echo "现在（now）：$(now)"

10. echo "现在（curtime）：$(curtime)"

11. echo "上月（last\_month）：$(last\_month)"

12. echo "上月（last\_month\_packed）：$(last\_month\_packed)"

13. echo "上月第一天（first\_date\_of\_last\_month）：$(first\_date\_of\_last\_month)"

14. echo "上月最后一天（last\_date\_of\_last\_month）：$(last\_date\_of\_last\_month)"

15. echo "今天星期几（day\_of\_week）：$(day\_of\_week)"

16. echo "上个小时（last\_hour）：$(last\_hour)"

17. echo "当前的小时（the\_hour）：$(the\_hour)"

18. echo "当前的分钟（the\_minute）：$(the\_minute)"

19. echo "当前的秒钟（the\_second）：$(the\_second)"

20. echo "当前的年份（the\_year）：$(the\_year)"

21. echo "当前的月份（the\_month）：$(the\_month)"

22. echo "当前的日期（the\_date）：$(the\_date)"

23. echo "前天（days\_ago 2）：$(days\_ago 2)"

24. echo "明天（days\_ago -1）：$(days\_ago -1)"

25. echo "后天（days\_ago -2）：$(days\_ago -2)"

26. echo "十天前的日期（days\_ago 10）：$(days\_ago 10)"

27. echo "中文的日期星期（chinese\_date\_and\_week）：$(chinese\_date\_and\_week)"

28. echo "随机数字（rand\_digit）：$(rand\_digit)"

29. echo "随机数字（rand\_digit）：$(rand\_digit)"

30. echo "自1970年来的秒数（seconds\_of\_date）：$(seconds\_of\_date)"

31. echo "自1970年来的秒数（seconds\_of\_date 2010-02-27）：$(seconds\_of\_date 2010-02-27)"

32. echo "自1970年来的秒数（seconds\_of\_date 2010-02-27 15:53:21）：$(seconds\_of\_date 2010-02-27 15:53:21)"

33. echo "自1970年来的秒数对应的日期（date\_of\_seconds 1267200000）：$(date\_of\_seconds 1267200000)"

34. echo "自1970年来的秒数对应的日期时间（datetime\_of\_seconds 1267257201）：$(datetime\_of\_seconds 1267257201)"

35.

36. if leap\_year 2010; then

37. echo "2010年是闰年";

38. fi

39. if leap\_year 2008; then

40. echo "2008年是闰年";

41. fi

42. if validity\_of\_date 2007 02 03; then

43. echo "2007 02 03 日期合法"

44. fi

45. if validity\_of\_date 2007 02 28; then

46. echo "2007 02 28 日期合法"

47. fi

48. if validity\_of\_date 2007 02 29; then

49. echo "2007 02 29 日期合法"

50. fi

51. if validity\_of\_date 2007 03 00; then

52. echo "2007 03 00 日期合法"

53. fi

54.

55. echo "2010年2月的天数（days\_of\_month 2 2010）：$(days\_of\_month 2 2010)"

56. echo "2008年2月的天数（days\_of\_month 2 2008）：$(days\_of\_month 2 2008)"

文件：test\_datetime.txt

Text代码

![](/images/legacy/legacy-82ce4531b7.png)

1. 当前时间（date）：六 2月 27 15:58:28 CST 2010

2. 昨天（yesterday）：2010\-02\-26

3. 今天（today）：2010\-02\-27

4. 现在（now）：2010\-02\-27 15:58:28.734817000

5. 现在（curtime）：2010\-02\-27 15:58:28

6. 上月（last\_month）：2010\-01

7. 上月（last\_month\_packed）：201001

8. 上月第一天（first\_date\_of\_last\_month）：2010\-01\-01

9. 上月最后一天（last\_date\_of\_last\_month）：2010\-01\-31

10. 今天星期几（day\_of\_week）：6

11. 上个小时（last\_hour）：2010\-02\-27\-14

12. 当前的小时（the\_hour）：15

13. 当前的分钟（the\_minute）：58

14. 当前的秒钟（the\_second）：28

15. 当前的年份（the\_year）：2010

16. 当前的月份（the\_month）：2

17. 当前的日期（the\_date）：27

18. 前天（days\_ago 2）：2010\-02\-25

19. 明天（days\_ago -1）：2010\-02\-28

20. 后天（days\_ago -2）：2010\-03\-01

21. 十天前的日期（days\_ago 10）：2010\-02\-17

22. 中文的日期星期（chinese\_date\_and\_week）：2月27日 星期六

23. 随机数字（rand\_digit）：5

24. 随机数字（rand\_digit）：9

25. 自1970年来的秒数（seconds\_of\_date）：1267257508

26. 自1970年来的秒数（seconds\_of\_date 2010\-02\-27）：1267200000

27. 自1970年来的秒数（seconds\_of\_date 2010\-02\-27 15:53:21）：1267257201

28. 自1970年来的秒数对应的日期（date\_of\_seconds 1267200000）：2010\-02\-27

29. 自1970年来的秒数对应的日期时间（datetime\_of\_seconds 1267257201）：2010\-02\-27 15:53:21

30. 2008年是闰年

31. 2007 02 03 日期合法

32. 2007 02 28 日期合法

33. 2010年2月的天数（days\_of\_month 2 2010）：28

34. 2008年2月的天数（days\_of\_month 2 2008）：29
