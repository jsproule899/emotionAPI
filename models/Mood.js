class Mood {

    
    constructor(id, timestamp, comment, emoVal1, emoVal2, emoVal3, emoVal4, emoVal5, emoVal6, emoVal7, conVal1, conVal2, conVal3, conVal4, conVal5, conVal6, conVal7, conVal8) {

        this.user_id = id,
        this.timestamp = timestamp,
        this.context_comment = comment,
        this.emotion = { enjoyment: emoVal1, sadness: emoVal2, anger: emoVal3, contempt: emoVal4, disgust: emoVal5, fear: emoVal6, surprise: emoVal7 },
        this.context = { romance: conVal1, family: conVal2, work: conVal3, holiday: conVal4, lonely: conVal5, exercise: conVal6, friends: conVal7, shopping: conVal8 }

    }    

}


module.exports = Mood;