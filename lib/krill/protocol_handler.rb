module Krill

  class ProtocolHandler

    attr_accessor :job

    def initialize jid

      @job = Job.find(jid)
      @path = @job.path
      @sha = @job.sha
      @content = Repo::contents @path, @sha

      eval(@content) # adds protocol def to this class
      
      puts "Initializing Thread Handler in Thread = #{Thread.current}"

      @thread = Thread.new { 

        puts "Protocol thread = #{Thread.current}"

        Thread.stop
         
        protocol

        @job.reload
        @job.pc = Job.COMPLETED
        @job.save

        ActiveRecord::Base.connection.close

      }

    end

    def append_step s

      @job.reload
      state = JSON.parse @job.state, symbolize_names: true
      state.push s
      @job.state = state.to_json
      @job.save

    end

    def display page

      append_step( { operation: "display", content: page } )

      @job.reload
      @job.pc += 1
      @job.save

      puts "STOPPING THREAD FOR JOB #{@job.id} with thread = #{Thread.current}"
      Thread.stop

    end

    def start

      puts "Starting job #{@job.id}"

      @job.reload
      @job.pc = 0
      @job.save

      @thread.wakeup

    end

    def continue

      puts "Continuing job #{@job.id}"

      if @thread.alive?
        @thread.wakeup
      end

      @thread.alive?

    end

  end
 
end
